namespace GolfLeagueApi.Auth;

public interface IAuthProvider
{
    Task<AuthResult?> ValidateTokenAsync(string bearerToken);
}
