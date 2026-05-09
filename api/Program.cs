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

// GET /season/my-matchup-summary — returns the member's upcoming and most recent matchup
app.MapGet("/season/my-matchup-summary", async (HttpContext ctx, AppDbContext db) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    var membershipIdStr = ctx.Request.Headers["X-Membership-Id"].FirstOrDefault();
    if (!Guid.TryParse(membershipIdStr, out var membershipId))
        return Results.Json(new { error = "missing_membership" }, statusCode: 400);

    var membership = await db.LeagueMemberships
        .Include(m => m.TeamMembership)
        .FirstOrDefaultAsync(m => m.Id == membershipId && m.GolferId == golfer.Id && m.ArchivedAt == null);

    if (membership is null)
        return Results.Json(new { error = "forbidden" }, statusCode: 403);

    if (membership.TeamMembership is null)
        return Results.Ok(new { upcoming = (object?)null, previous = (object?)null });

    var teamId = membership.TeamMembership.TeamId;
    var today = DateOnly.FromDateTime(DateTime.UtcNow);

    var upcomingRaw = await db.Matchups
        .Where(m => (m.TeamAId == teamId || m.TeamBId == teamId) && m.Week.SeasonId == membership.SeasonId && m.Week.StartDate >= today)
        .OrderBy(m => m.Week.StartDate)
        .Select(m => new
        {
            weekNumber = m.Week.WeekNumber,
            startDate = m.Week.StartDate,
            teamAId = m.TeamAId,
            teamAName = m.TeamA.Name,
            teamAMembers = m.TeamA.TeamMemberships.Select(tm => new { firstName = tm.LeagueMembership.Golfer.FirstName, lastName = tm.LeagueMembership.Golfer.LastName }),
            teamBName = m.TeamB.Name,
            teamBMembers = m.TeamB.TeamMemberships.Select(tm => new { firstName = tm.LeagueMembership.Golfer.FirstName, lastName = tm.LeagueMembership.Golfer.LastName }),
        })
        .FirstOrDefaultAsync();

    var previousRaw = await db.Matchups
        .Where(m => (m.TeamAId == teamId || m.TeamBId == teamId) && m.Week.SeasonId == membership.SeasonId && m.Week.StartDate < today)
        .OrderByDescending(m => m.Week.StartDate)
        .Select(m => new
        {
            weekNumber = m.Week.WeekNumber,
            startDate = m.Week.StartDate,
            teamAId = m.TeamAId,
            teamAName = m.TeamA.Name,
            teamAMembers = m.TeamA.TeamMemberships.Select(tm => new { firstName = tm.LeagueMembership.Golfer.FirstName, lastName = tm.LeagueMembership.Golfer.LastName }),
            teamBName = m.TeamB.Name,
            teamBMembers = m.TeamB.TeamMemberships.Select(tm => new { firstName = tm.LeagueMembership.Golfer.FirstName, lastName = tm.LeagueMembership.Golfer.LastName }),
        })
        .FirstOrDefaultAsync();

    var iAmUpcomingTeamA = upcomingRaw?.teamAId == teamId;
    var upcoming = upcomingRaw is null ? null : (object)new
    {
        weekNumber = upcomingRaw.weekNumber,
        startDate = upcomingRaw.startDate,
        myTeam = new { name = iAmUpcomingTeamA ? upcomingRaw.teamAName : upcomingRaw.teamBName, members = iAmUpcomingTeamA ? upcomingRaw.teamAMembers : upcomingRaw.teamBMembers },
        opponent = new { name = iAmUpcomingTeamA ? upcomingRaw.teamBName : upcomingRaw.teamAName, members = iAmUpcomingTeamA ? upcomingRaw.teamBMembers : upcomingRaw.teamAMembers },
    };

    var iAmPreviousTeamA = previousRaw?.teamAId == teamId;
    var previous = previousRaw is null ? null : (object)new
    {
        weekNumber = previousRaw.weekNumber,
        startDate = previousRaw.startDate,
        myTeam = new { name = iAmPreviousTeamA ? previousRaw.teamAName : previousRaw.teamBName, members = iAmPreviousTeamA ? previousRaw.teamAMembers : previousRaw.teamBMembers },
        opponent = new { name = iAmPreviousTeamA ? previousRaw.teamBName : previousRaw.teamAName, members = iAmPreviousTeamA ? previousRaw.teamBMembers : previousRaw.teamAMembers },
        hasResults = false, // TODO: replace with Round existence check when score entry lands
    };

    return Results.Ok(new { upcoming, previous });
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

// GET /commissioner/season/teams — teams, unassigned members, and lock state
commissioner.MapGet("/season/teams", async (HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;
    var today = DateOnly.FromDateTime(DateTime.UtcNow);

    var isLocked = await db.Weeks.AnyAsync(w => w.SeasonId == membership.SeasonId && w.StartDate <= today);

    var teams = await db.Teams
        .Where(t => t.SeasonId == membership.SeasonId && t.ArchivedAt == null)
        .OrderBy(t => t.Name)
        .Select(t => new
        {
            teamId = t.Id,
            name = t.Name,
            members = t.TeamMemberships.Select(tm => new
            {
                leagueMembershipId = tm.LeagueMembershipId,
                firstName = tm.LeagueMembership.Golfer.FirstName,
                lastName = tm.LeagueMembership.Golfer.LastName
            }).ToList()
        })
        .ToListAsync();

    var unassigned = await db.LeagueMemberships
        .Where(m => m.SeasonId == membership.SeasonId && m.ArchivedAt == null && m.TeamMembership == null)
        .OrderBy(m => m.Golfer.LastName).ThenBy(m => m.Golfer.FirstName)
        .Select(m => new
        {
            leagueMembershipId = m.Id,
            firstName = m.Golfer.FirstName,
            lastName = m.Golfer.LastName
        })
        .ToListAsync();

    return Results.Ok(new { isLocked, teams, unassigned });
});

// POST /commissioner/season/teams — create a team with exactly 2 members
commissioner.MapPost("/season/teams", async (CreateTeamRequest req, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    if (req.MemberIds == null || req.MemberIds.Length != 2)
        return Results.Json(new { error = "exactly_2_members_required" }, statusCode: 400);

    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var isLocked = await db.Weeks.AnyAsync(w => w.SeasonId == membership.SeasonId && w.StartDate <= today);
    if (isLocked)
        return Results.Json(new { error = "teams_locked" }, statusCode: 409);

    var members = await db.LeagueMemberships
        .Include(m => m.TeamMembership)
        .Include(m => m.Golfer)
        .Where(m => req.MemberIds.Contains(m.Id) && m.SeasonId == membership.SeasonId && m.ArchivedAt == null)
        .ToListAsync();

    if (members.Count != 2)
        return Results.Json(new { error = "invalid_member_ids" }, statusCode: 400);

    if (members.Any(m => m.TeamMembership != null))
        return Results.Json(new { error = "member_already_assigned" }, statusCode: 409);

    var teamCount = await db.Teams.CountAsync(t => t.SeasonId == membership.SeasonId && t.ArchivedAt == null);
    var teamName = $"Team {teamCount + 1}";

    var now = DateTime.UtcNow;
    var team = new Team
    {
        Id = Guid.NewGuid(),
        SeasonId = membership.SeasonId,
        Name = teamName,
        CreatedAt = now,
        UpdatedAt = now
    };
    db.Teams.Add(team);

    foreach (var m in members)
    {
        db.TeamMemberships.Add(new TeamMembership
        {
            Id = Guid.NewGuid(),
            TeamId = team.Id,
            LeagueMembershipId = m.Id,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    await db.SaveChangesAsync();

    return Results.Created($"/commissioner/season/teams/{team.Id}", new
    {
        teamId = team.Id,
        name = team.Name,
        members = members.Select(m => new
        {
            leagueMembershipId = m.Id,
            firstName = m.Golfer.FirstName,
            lastName = m.Golfer.LastName
        })
    });
});

// GET /commissioner/season/schedule — weeks for the season ordered by week number
commissioner.MapGet("/season/schedule", async (HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;
    var weeks = await db.Weeks
        .Where(w => w.SeasonId == membership.SeasonId)
        .OrderBy(w => w.WeekNumber)
        .Select(w => new
        {
            id = w.Id,
            weekNumber = w.WeekNumber,
            startDate = w.StartDate,
            type = w.Type.ToString()
        })
        .ToListAsync();
    return Results.Ok(weeks);
});

// PATCH /commissioner/season/teams/{teamId}/name — rename a team (allowed before and after season start)
commissioner.MapPatch("/season/teams/{teamId}/name", async (Guid teamId, RenameTeamRequest req, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    if (string.IsNullOrWhiteSpace(req.Name))
        return Results.Json(new { error = "name_required" }, statusCode: 422);

    var team = await db.Teams
        .FirstOrDefaultAsync(t => t.Id == teamId && t.SeasonId == membership.SeasonId && t.ArchivedAt == null);

    if (team is null)
        return Results.NotFound();

    team.Name = req.Name.Trim();
    team.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(new { teamId = team.Id, name = team.Name });
});

// DELETE /commissioner/season/teams/{teamId} — disband a team
commissioner.MapDelete("/season/teams/{teamId}", async (Guid teamId, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    var team = await db.Teams
        .Include(t => t.TeamMemberships)
        .FirstOrDefaultAsync(t => t.Id == teamId && t.SeasonId == membership.SeasonId && t.ArchivedAt == null);

    if (team is null)
        return Results.NotFound();

    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var isLocked = await db.Weeks.AnyAsync(w => w.SeasonId == membership.SeasonId && w.StartDate <= today);
    if (isLocked)
        return Results.Json(new { error = "teams_locked" }, statusCode: 409);

    db.TeamMemberships.RemoveRange(team.TeamMemberships);
    team.ArchivedAt = DateTime.UtcNow;
    team.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// GET /commissioner/season/matchups?weekId=<id>
commissioner.MapGet("/season/matchups", async (Guid weekId, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    var week = await db.Weeks
        .FirstOrDefaultAsync(w => w.Id == weekId && w.SeasonId == membership.SeasonId);
    if (week is null)
        return Results.NotFound();

    var matchups = await db.Matchups
        .Where(m => m.WeekId == weekId)
        .Select(m => new
        {
            matchupId = m.Id,
            teamA = new
            {
                teamId = m.TeamA.Id,
                name = m.TeamA.Name,
                members = m.TeamA.TeamMemberships.Select(tm => new
                {
                    firstName = tm.LeagueMembership.Golfer.FirstName,
                    lastName = tm.LeagueMembership.Golfer.LastName
                })
            },
            teamB = new
            {
                teamId = m.TeamB.Id,
                name = m.TeamB.Name,
                members = m.TeamB.TeamMemberships.Select(tm => new
                {
                    firstName = tm.LeagueMembership.Golfer.FirstName,
                    lastName = tm.LeagueMembership.Golfer.LastName
                })
            },
            isLocked = false // TODO: replace with Round existence check when score entry lands
        })
        .ToListAsync();

    return Results.Ok(matchups);
});

// POST /commissioner/season/matchups
commissioner.MapPost("/season/matchups", async (CreateMatchupRequest req, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    if (req.TeamAId == req.TeamBId)
        return Results.Json(new { error = "same_team" }, statusCode: 422);

    var week = await db.Weeks
        .FirstOrDefaultAsync(w => w.Id == req.WeekId && w.SeasonId == membership.SeasonId);
    if (week is null)
        return Results.Json(new { error = "invalid_week" }, statusCode: 422);
    if (week.Type != WeekType.Regular)
        return Results.Json(new { error = "week_not_regular" }, statusCode: 422);

    var teamIds = new[] { req.TeamAId, req.TeamBId };
    var teams = await db.Teams
        .Include(t => t.TeamMemberships)
            .ThenInclude(tm => tm.LeagueMembership)
                .ThenInclude(m => m.Golfer)
        .Where(t => teamIds.Contains(t.Id) && t.SeasonId == membership.SeasonId && t.ArchivedAt == null)
        .ToListAsync();

    if (teams.Count != 2)
        return Results.Json(new { error = "invalid_team" }, statusCode: 422);
    if (teams.Any(t => !t.TeamMemberships.Any()))
        return Results.Json(new { error = "empty_team" }, statusCode: 422);

    var alreadyScheduled = await db.Matchups
        .AnyAsync(m => m.WeekId == req.WeekId && (teamIds.Contains(m.TeamAId) || teamIds.Contains(m.TeamBId)));
    if (alreadyScheduled)
        return Results.Json(new { error = "team_already_scheduled" }, statusCode: 409);

    var now = DateTime.UtcNow;
    var matchup = new Matchup
    {
        Id = Guid.NewGuid(),
        WeekId = req.WeekId,
        TeamAId = req.TeamAId,
        TeamBId = req.TeamBId,
        CreatedBy = membership.Id,
        UpdatedBy = membership.Id,
        CreatedAt = now,
        UpdatedAt = now
    };
    db.Matchups.Add(matchup);

    var pairing = new Pairing
    {
        Id = Guid.NewGuid(),
        MatchupId = matchup.Id,
        CreatedBy = membership.Id,
        UpdatedBy = membership.Id,
        CreatedAt = now,
        UpdatedAt = now
    };
    db.Pairings.Add(pairing);

    foreach (var team in teams)
    {
        foreach (var tm in team.TeamMemberships)
        {
            db.PairingSlots.Add(new PairingSlot
            {
                Id = Guid.NewGuid(),
                PairingId = pairing.Id,
                LeagueMembershipId = tm.LeagueMembershipId,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    await db.SaveChangesAsync();

    var teamA = teams.First(t => t.Id == req.TeamAId);
    var teamB = teams.First(t => t.Id == req.TeamBId);
    return Results.Created($"/commissioner/season/matchups/{matchup.Id}", new
    {
        matchupId = matchup.Id,
        teamA = new
        {
            teamId = teamA.Id,
            name = teamA.Name,
            members = teamA.TeamMemberships.Select(tm => new
            {
                firstName = tm.LeagueMembership.Golfer.FirstName,
                lastName = tm.LeagueMembership.Golfer.LastName
            })
        },
        teamB = new
        {
            teamId = teamB.Id,
            name = teamB.Name,
            members = teamB.TeamMemberships.Select(tm => new
            {
                firstName = tm.LeagueMembership.Golfer.FirstName,
                lastName = tm.LeagueMembership.Golfer.LastName
            })
        },
        isLocked = false
    });
});

// PUT /commissioner/season/matchups/{matchupId}
commissioner.MapPut("/season/matchups/{matchupId}", async (Guid matchupId, UpdateMatchupRequest req, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    if (req.TeamAId == req.TeamBId)
        return Results.Json(new { error = "same_team" }, statusCode: 422);

    var matchup = await db.Matchups
        .Include(m => m.Pairing)
            .ThenInclude(p => p.PairingSlots)
        .Include(m => m.Week)
        .FirstOrDefaultAsync(m => m.Id == matchupId && m.Week.SeasonId == membership.SeasonId);

    if (matchup is null)
        return Results.NotFound();

    var isLocked = false; // TODO: replace with Round existence check when score entry lands
    if (isLocked)
        return Results.Json(new { error = "matchup_locked" }, statusCode: 409);

    var teamIds = new[] { req.TeamAId, req.TeamBId };
    var teams = await db.Teams
        .Include(t => t.TeamMemberships)
            .ThenInclude(tm => tm.LeagueMembership)
                .ThenInclude(m => m.Golfer)
        .Where(t => teamIds.Contains(t.Id) && t.SeasonId == membership.SeasonId && t.ArchivedAt == null)
        .ToListAsync();

    if (teams.Count != 2)
        return Results.Json(new { error = "invalid_team" }, statusCode: 422);
    if (teams.Any(t => !t.TeamMemberships.Any()))
        return Results.Json(new { error = "empty_team" }, statusCode: 422);

    var alreadyScheduled = await db.Matchups
        .AnyAsync(m => m.WeekId == matchup.WeekId && m.Id != matchupId &&
                       (teamIds.Contains(m.TeamAId) || teamIds.Contains(m.TeamBId)));
    if (alreadyScheduled)
        return Results.Json(new { error = "team_already_scheduled" }, statusCode: 409);

    var now = DateTime.UtcNow;
    matchup.TeamAId = req.TeamAId;
    matchup.TeamBId = req.TeamBId;
    matchup.UpdatedBy = membership.Id;
    matchup.UpdatedAt = now;

    matchup.Pairing.UpdatedBy = membership.Id;
    matchup.Pairing.UpdatedAt = now;

    db.PairingSlots.RemoveRange(matchup.Pairing.PairingSlots);

    foreach (var team in teams)
    {
        foreach (var tm in team.TeamMemberships)
        {
            db.PairingSlots.Add(new PairingSlot
            {
                Id = Guid.NewGuid(),
                PairingId = matchup.Pairing.Id,
                LeagueMembershipId = tm.LeagueMembershipId,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    await db.SaveChangesAsync();

    var teamA = teams.First(t => t.Id == req.TeamAId);
    var teamB = teams.First(t => t.Id == req.TeamBId);
    return Results.Ok(new
    {
        matchupId = matchup.Id,
        teamA = new
        {
            teamId = teamA.Id,
            name = teamA.Name,
            members = teamA.TeamMemberships.Select(tm => new
            {
                firstName = tm.LeagueMembership.Golfer.FirstName,
                lastName = tm.LeagueMembership.Golfer.LastName
            })
        },
        teamB = new
        {
            teamId = teamB.Id,
            name = teamB.Name,
            members = teamB.TeamMemberships.Select(tm => new
            {
                firstName = tm.LeagueMembership.Golfer.FirstName,
                lastName = tm.LeagueMembership.Golfer.LastName
            })
        },
        isLocked = false
    });
});

// DELETE /commissioner/season/matchups/{matchupId}
commissioner.MapDelete("/season/matchups/{matchupId}", async (Guid matchupId, HttpContext ctx, AppDbContext db) =>
{
    var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;

    var matchup = await db.Matchups
        .Include(m => m.Pairing)
            .ThenInclude(p => p.PairingSlots)
        .Include(m => m.Week)
        .FirstOrDefaultAsync(m => m.Id == matchupId && m.Week.SeasonId == membership.SeasonId);

    if (matchup is null)
        return Results.NotFound();

    var isLocked = false; // TODO: replace with Round existence check when score entry lands
    if (isLocked)
        return Results.Json(new { error = "matchup_locked" }, statusCode: 409);

    db.PairingSlots.RemoveRange(matchup.Pairing.PairingSlots);
    db.Pairings.Remove(matchup.Pairing);
    db.Matchups.Remove(matchup);
    await db.SaveChangesAsync();

    return Results.NoContent();
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
record CreateTeamRequest(Guid[] MemberIds);
record RenameTeamRequest(string Name);
record CreateMatchupRequest(Guid WeekId, Guid TeamAId, Guid TeamBId);
record UpdateMatchupRequest(Guid TeamAId, Guid TeamBId);
record SetupRequirement(string Name, bool IsMet, string Detail);
record SetupStatus(bool IsComplete, SetupRequirement[] Requirements);
