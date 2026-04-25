namespace GolfLeagueApi.Auth;

public class Auth0AuthProvider : IAuthProvider
{
    public Task<AuthResult?> ResolveAsync(HttpContext context)
    {
        throw new NotImplementedException("Auth0 authentication is not yet implemented.");
    }
}
