using GolfLeagueApi.Auth;
using GolfLeagueApi.Data;
using GolfLeagueApi.Extensions;
using GolfLeagueApi.Middleware;
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

// GET /me
app.MapGet("/me", async (HttpContext ctx, AppDbContext db) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Json(new { error = "missing_token" }, statusCode: 401);

    var memberships = await db.LeagueMemberships
        .Where(m => m.GolferId == golfer.Id && m.ArchivedAt == null && m.Season.ArchivedAt == null)
        .Select(m => new
        {
            leagueName = m.Season.League.Name,
            seasonYear = m.Season.Year
        })
        .ToListAsync();

    return Results.Ok(new
    {
        id = golfer.Id,
        firstName = golfer.FirstName,
        lastName = golfer.LastName,
        email = golfer.Email,
        course = new { name = golfer.Course.Name },
        memberships
    });
});

app.Run();

record DevLoginRequest(Guid GolferId);
