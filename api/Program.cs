using GolfLeagueApi.Auth;
using GolfLeagueApi.Data;
using GolfLeagueApi.Extensions;
using GolfLeagueApi.Middleware;
using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
           .UseSnakeCaseNamingConvention());

// CORS
var allowedOrigins = (builder.Configuration["ALLOWED_ORIGINS"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// Options
builder.Services.Configure<Auth0Options>(builder.Configuration.GetSection("Auth:Auth0"));
builder.Services.Configure<MockAuthOptions>(builder.Configuration.GetSection("Auth:Mock"));
builder.Services.Configure<AppOptions>(builder.Configuration.GetSection("App"));

// Auth provider
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

var authProvider = builder.Configuration["Auth:Provider"] ?? "mock";
if (authProvider.Equals("mock", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<MockAuthProvider>();
    builder.Services.AddScoped<IAuthProvider>(sp => sp.GetRequiredService<MockAuthProvider>());
}
else if (authProvider.Equals("auth0", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddScoped<IAuthProvider, Auth0AuthProvider>();
}
else
{
    throw new InvalidOperationException($"Unknown Auth:Provider value '{authProvider}'. Valid values: mock, auth0.");
}

var app = builder.Build();

// Startup validation — production guard
if (authProvider.Equals("mock", StringComparison.OrdinalIgnoreCase) &&
    app.Environment.IsProduction())
{
    throw new InvalidOperationException(
        "Auth:Provider=mock cannot be used in the Production environment. Configure Auth:Provider=auth0.");
}

// Startup validation — Auth0 requires Domain and Audience
if (authProvider.Equals("auth0", StringComparison.OrdinalIgnoreCase))
{
    var domain = builder.Configuration["Auth:Auth0:Domain"];
    var audience = builder.Configuration["Auth:Auth0:Audience"];
    if (string.IsNullOrWhiteSpace(domain))
        throw new InvalidOperationException("Auth:Auth0:Domain is required when Auth:Provider=auth0.");
    if (string.IsNullOrWhiteSpace(audience))
        throw new InvalidOperationException("Auth:Auth0:Audience is required when Auth:Provider=auth0.");
}

// Startup validation — DefaultCourseId required and must be a valid GUID
var defaultCourseIdRaw = builder.Configuration["App:DefaultCourseId"];
if (string.IsNullOrWhiteSpace(defaultCourseIdRaw) || !Guid.TryParse(defaultCourseIdRaw, out _))
    throw new InvalidOperationException("App:DefaultCourseId is required and must be a valid GUID.");

// Run EF Core migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseCors();
app.UseMiddleware<GolferContextMiddleware>();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Dev endpoints — only registered in mock mode
if (authProvider.Equals("mock", StringComparison.OrdinalIgnoreCase))
{
    app.MapGet("/dev/golfers", async (AppDbContext db) =>
    {
        var golfers = await db.Golfers
            .Where(g => g.ArchivedAt == null)
            .OrderBy(g => g.LastName).ThenBy(g => g.FirstName)
            .Select(g => new { g.Id, g.FirstName, g.LastName, g.Email })
            .ToListAsync();
        return Results.Ok(golfers);
    });

    app.MapPost("/dev/login", async (DevLoginRequest req, MockAuthProvider mockAuth) =>
    {
        string token;
        try
        {
            token = await mockAuth.IssueTokenAsync(req.GolferId);
        }
        catch (ArgumentException ex) when (ex.ParamName == "golferId")
        {
            return Results.NotFound();
        }
        return Results.Ok(new { token });
    });
}

// GET /me — profile only
app.MapGet("/me", (HttpContext ctx) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    return Results.Ok(new
    {
        id = golfer.Id,
        firstName = golfer.FirstName,
        lastName = golfer.LastName,
        email = golfer.Email,
        course = new { name = golfer.Course.Name }
    });
});

// GET /context — resolve league context for the authenticated golfer
app.MapGet("/context", async (HttpContext ctx, AppDbContext db, Guid? membershipId) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    var today = DateOnly.FromDateTime(DateTime.UtcNow);

    var all = await db.LeagueMemberships
        .Where(m => m.GolferId == golfer.Id && m.ArchivedAt == null && m.Season.ArchivedAt == null)
        .Select(m => new
        {
            m.Id,
            m.IsCommissioner,
            m.SeasonId,
            LeagueId = m.Season.LeagueId,
            CourseId = m.Season.League.CourseId,
            LeagueName = m.Season.League.Name,
            SeasonYear = m.Season.Year,
            m.Season.StartDate,
            m.Season.EndDate
        })
        .ToListAsync();

    // Active season first; fall back to most recently ended non-archived season
    var activeCandidates = all.Where(m => m.StartDate <= today && m.EndDate >= today).ToList();
    var candidates = activeCandidates.Count > 0
        ? activeCandidates
        : all.Where(m => m.EndDate < today)
             .OrderByDescending(m => m.EndDate)
             .GroupBy(m => m.EndDate)
             .FirstOrDefault()
             ?.ToList() ?? [];

    if (candidates.Count == 0)
        return Results.Ok(new { status = "no_leagues" });

    // Validate optional hint — must belong to this golfer's candidates
    var hint = membershipId.HasValue
        ? candidates.FirstOrDefault(c => c.Id == membershipId.Value)
        : null;

    var resolved = hint ?? (candidates.Count == 1 ? candidates[0] : null);

    if (resolved is not null)
    {
        return Results.Ok(new
        {
            status = "resolved",
            context = new
            {
                golferId = golfer.Id,
                leagueMembershipId = resolved.Id,
                seasonId = resolved.SeasonId,
                leagueId = resolved.LeagueId,
                courseId = resolved.CourseId,
                isCommissioner = resolved.IsCommissioner,
                leagueName = resolved.LeagueName,
                seasonYear = resolved.SeasonYear
            }
        });
    }

    return Results.Ok(new
    {
        status = "pick_required",
        memberships = candidates.Select(c => new
        {
            id = c.Id,
            leagueName = c.LeagueName,
            seasonYear = c.SeasonYear,
            isCommissioner = c.IsCommissioner
        })
    });
});

// GET /season/setup-status — accessible to any authenticated member, returns isComplete only
app.MapGet("/season/setup-status", async (HttpContext ctx, AppDbContext db) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    var membershipIdStr = ctx.Request.Headers["X-Membership-Id"].FirstOrDefault();
    if (!Guid.TryParse(membershipIdStr, out var membershipId))
        return Results.Json(new { error = "missing_membership" }, statusCode: 400);

    var membership = await db.LeagueMemberships
        .FirstOrDefaultAsync(m => m.Id == membershipId && m.GolferId == golfer.Id && m.ArchivedAt == null);

    if (membership is null)
        return Results.Json(new { error = "forbidden" }, statusCode: 403);

    var status = await ComputeSetupStatus(membership.SeasonId, db);
    return Results.Ok(new { isComplete = status.IsComplete });
});

// Commissioner route group — requires X-Membership-Id header for a commissioner membership
var commissioner = app.MapGroup("/commissioner").AddEndpointFilter(async (ctx, next) =>
{
    var golfer = ctx.HttpContext.Items["Golfer"] as Golfer;
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    var membershipIdStr = ctx.HttpContext.Request.Headers["X-Membership-Id"].FirstOrDefault();
    if (!Guid.TryParse(membershipIdStr, out var membershipId))
        return Results.Json(new { error = "missing_membership" }, statusCode: 400);

    var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
    var membership = await db.LeagueMemberships
        .FirstOrDefaultAsync(m => m.Id == membershipId && m.GolferId == golfer.Id && m.ArchivedAt == null);

    if (membership is null || !membership.IsCommissioner)
        return Results.Json(new { error = "forbidden" }, statusCode: 403);

    ctx.HttpContext.Items["ActiveMembership"] = membership;
    return await next(ctx);
});

// GET /commissioner/season/setup-status — full SeasonSetupStatus for commissioners
commissioner.MapGet("/season/setup-status", async (HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;
    var status = await ComputeSetupStatus(membership.SeasonId, db);
    return Results.Ok(status);
});

// GET /commissioner/season/roster — active members for the season, sorted by last name
commissioner.MapGet("/season/roster", async (HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;
    var members = await db.LeagueMemberships
        .Where(m => m.SeasonId == membership.SeasonId && m.ArchivedAt == null)
        .OrderBy(m => m.Golfer.LastName).ThenBy(m => m.Golfer.FirstName)
        .Select(m => new
        {
            leagueMembershipId = m.Id,
            golferId = m.GolferId,
            firstName = m.Golfer.FirstName,
            lastName = m.Golfer.LastName,
            email = m.Golfer.Email,
            handicap = m.Handicap,
            isCommissioner = m.IsCommissioner
        })
        .ToListAsync();
    return Results.Ok(members);
});

// PATCH /commissioner/season/roster/{leagueMembershipId}/handicap
commissioner.MapPatch("/season/roster/{leagueMembershipId}/handicap", async (
    Guid leagueMembershipId,
    HandicapUpdateRequest req,
    HttpContext ctx,
    AppDbContext db) =>
{
    var activeMembership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    var target = await db.LeagueMemberships
        .Include(m => m.Golfer)
        .FirstOrDefaultAsync(m => m.Id == leagueMembershipId && m.ArchivedAt == null);

    if (target is null)
        return Results.NotFound();

    if (target.SeasonId != activeMembership.SeasonId)
        return Results.Json(new { error = "forbidden" }, statusCode: 403);

    target.Handicap = req.Handicap;
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        leagueMembershipId = target.Id,
        golferId = target.GolferId,
        firstName = target.Golfer.FirstName,
        lastName = target.Golfer.LastName,
        email = target.Golfer.Email,
        handicap = target.Handicap,
        isCommissioner = target.IsCommissioner
    });
});

app.Run();

static async Task<SetupStatus> ComputeSetupStatus(Guid seasonId, AppDbContext db)
{
    var memberCount = await db.LeagueMemberships
        .CountAsync(m => m.SeasonId == seasonId && m.ArchivedAt == null);

    var rosterMet = memberCount >= 2;
    var rosterDetail = rosterMet
        ? $"{memberCount} members added"
        : $"{memberCount} member{(memberCount == 1 ? "" : "s")} added — need at least 2";

    var unassigned = await db.LeagueMemberships
        .Where(m => m.SeasonId == seasonId && m.ArchivedAt == null && m.TeamMembership == null)
        .Select(m => m.Golfer.FirstName + " " + m.Golfer.LastName)
        .ToListAsync();
    var teamsMet = unassigned.Count == 0;
    var teamsDetail = teamsMet
        ? "All members assigned to a team"
        : string.Join(", ", unassigned) + (unassigned.Count == 1 ? " is" : " are") + " not on a team";

    var weekCount = await db.Weeks.CountAsync(w => w.SeasonId == seasonId);
    var scheduleMet = weekCount > 0;
    var scheduleDetail = weekCount == 1 ? "1 week scheduled" : $"{weekCount} weeks scheduled";

    var requirements = new[]
    {
        new SetupRequirement("Roster", rosterMet, rosterDetail),
        new SetupRequirement("Teams", teamsMet, teamsDetail),
        new SetupRequirement("Schedule", scheduleMet, scheduleDetail),
    };

    return new SetupStatus(requirements.All(r => r.IsMet), requirements);
}

record DevLoginRequest(Guid GolferId);
record HandicapUpdateRequest(decimal? Handicap);
record SetupRequirement(string Name, bool IsMet, string Detail);
record SetupStatus(bool IsComplete, SetupRequirement[] Requirements);
