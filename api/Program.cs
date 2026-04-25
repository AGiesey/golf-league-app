using GolfLeagueApi.Data;
using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// CORS
var allowedOrigins = (builder.Configuration["ALLOWED_ORIGINS"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// Run EF Core migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseCors();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Ping endpoint — connectivity spike: write + read through EF Core
app.MapGet("/ping", async (AppDbContext db) =>
{
    var ping = new Ping { CreatedAt = DateTime.UtcNow };
    db.Pings.Add(ping);
    await db.SaveChangesAsync();
    return Results.Ok(new { id = ping.Id, createdAt = ping.CreatedAt });
});

app.Run();
