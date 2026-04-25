namespace GolfLeagueApi.Auth;

public interface IAuthProvider
{
    Task<AuthResult?> ResolveAsync(HttpContext context);
}
