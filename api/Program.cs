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

// Auth provider
var authProvider = builder.Configuration["AUTH_PROVIDER"] ?? "mock";
if (authProvider == "auth0")
    throw new InvalidOperationException("AUTH_PROVIDER=auth0 is not yet implemented. Set AUTH_PROVIDER=mock or leave it unset.");
builder.Services.AddScoped<IAuthProvider, MockAuthProvider>();

var app = builder.Build();

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
if (authProvider == "mock")
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

    app.MapPost("/dev/login", async (HttpContext ctx, DevLoginRequest req, AppDbContext db) =>
    {
        var golfer = await db.Golfers.FindAsync(req.GolferId);
        if (golfer is null || golfer.ArchivedAt != null)
            return Results.NotFound();

        ctx.Response.Cookies.Append("mock-golfer-id", golfer.Id.ToString(), new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });
        return Results.Ok();
    });
}

// GET /me
app.MapGet("/me", async (HttpContext ctx, AppDbContext db) =>
{
    var golfer = ctx.RequireGolfer();
    if (golfer is null)
        return Results.Unauthorized();

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
