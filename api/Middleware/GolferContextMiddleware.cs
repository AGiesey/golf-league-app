using GolfLeagueApi.Auth;
using GolfLeagueApi.Data;
using Microsoft.EntityFrameworkCore;

namespace GolfLeagueApi.Middleware;

public class GolferContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IAuthProvider authProvider, AppDbContext db)
    {
        var result = await authProvider.ResolveAsync(context);
        if (result is not null)
        {
            var golfer = await db.Golfers
                .Include(g => g.Course)
                .FirstOrDefaultAsync(g => g.ExternalAuthId == result.ExternalAuthId && g.ArchivedAt == null);

            if (golfer is not null)
                context.Items["Golfer"] = golfer;
        }

        await next(context);
    }
}
