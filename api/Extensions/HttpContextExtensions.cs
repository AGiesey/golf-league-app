using GolfLeagueApi.Models;

namespace GolfLeagueApi.Extensions;

public static class HttpContextExtensions
{
    public static Golfer? RequireGolfer(this HttpContext context) =>
        context.Items["Golfer"] as Golfer;
}
