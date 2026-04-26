namespace GolfLeagueApi.Auth;

public class MockAuthProvider : IAuthProvider
{
    public Task<AuthResult?> ResolveAsync(HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("mock-golfer-id", out var golferId) || string.IsNullOrWhiteSpace(golferId))
            return Task.FromResult<AuthResult?>(null);

        return Task.FromResult<AuthResult?>(new AuthResult(golferId));
    }
}
