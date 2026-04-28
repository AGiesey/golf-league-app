using GolfLeagueApi.Auth;
using GolfLeagueApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GolfLeagueApi.Middleware;

public class GolferContextMiddleware(RequestDelegate next, IOptions<AppOptions> appOptions)
{
    private readonly Guid _defaultCourseId = appOptions.Value.DefaultCourseId;

    public async Task InvokeAsync(
        HttpContext context,
        IAuthProvider authProvider,
        AppDbContext db,
        ILogger<GolferContextMiddleware> logger)
    {
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/dev"))
        {
            await next(context);
            return;
        }

        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        if (authHeader is null || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            await WriteErrorAsync(context, 401, "missing_token");
            return;
        }

        var token = authHeader["Bearer ".Length..].Trim();
        var authResult = await authProvider.ValidateTokenAsync(token);
        if (authResult is null)
        {
            logger.LogWarning("Token validation failed for request {Method} {Path}",
                context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, 401, "invalid_token");
            return;
        }

        var golfer = await db.Golfers
            .Include(g => g.Course)
            .FirstOrDefaultAsync(g => g.ExternalAuthId == authResult.ExternalAuthId && g.ArchivedAt == null);

        if (golfer is null)
        {
            golfer = await db.Golfers
                .Include(g => g.Course)
                .FirstOrDefaultAsync(g =>
                    g.Email == authResult.Email &&
                    g.CourseId == _defaultCourseId &&
                    g.ExternalAuthId == null &&
                    g.ArchivedAt == null);

            if (golfer is not null)
            {
                try
                {
                    golfer.ExternalAuthId = authResult.ExternalAuthId;
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateException)
                {
                    golfer = await db.Golfers
                        .Include(g => g.Course)
                        .FirstOrDefaultAsync(g =>
                            g.ExternalAuthId == authResult.ExternalAuthId && g.ArchivedAt == null);

                    if (golfer is null)
                    {
                        await WriteErrorAsync(context, 403, "not_registered", authResult.Email);
                        return;
                    }
                }
            }
        }

        if (golfer is null)
        {
            await WriteErrorAsync(context, 403, "not_registered", authResult.Email);
            return;
        }

        context.Items["Golfer"] = golfer;
        await next(context);
    }

    private static async Task WriteErrorAsync(HttpContext context, int status, string error, string? email = null)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";

        if (email is not null)
            await context.Response.WriteAsJsonAsync(new { error, email });
        else
            await context.Response.WriteAsJsonAsync(new { error });
    }
}
