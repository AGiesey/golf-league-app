using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GolfLeagueApi.Auth;

public class Auth0AuthProvider(
    IOptions<Auth0Options> options,
    IMemoryCache cache,
    IHttpClientFactory httpClientFactory,
    ILogger<Auth0AuthProvider> logger) : IAuthProvider
{
    private readonly Auth0Options _opts = options.Value;
    private const string EmailClaim = "https://golf-league-app/email";

    public async Task<AuthResult?> ValidateTokenAsync(string bearerToken)
    {
        JsonWebKeySet jwks;
        try
        {
            jwks = await GetJwksAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to fetch JWKS from Auth0");
            return null;
        }

        var keys = jwks.GetSigningKeys();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = keys,
            ValidateIssuer = true,
            ValidIssuer = $"https://{_opts.Domain}/",
            ValidateAudience = true,
            ValidAudience = _opts.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var handler = new JwtSecurityTokenHandler();
            handler.ValidateToken(bearerToken, validationParams, out var securityToken);
            var jwt = (JwtSecurityToken)securityToken;

            var sub = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var email = jwt.Claims.FirstOrDefault(c => c.Type == EmailClaim)?.Value;

            if (sub is null || email is null)
            {
                logger.LogWarning("Auth0 JWT missing required claims: sub={SubPresent}, email={EmailPresent}",
                    sub is not null, email is not null);
                return null;
            }

            return new AuthResult(sub, email);
        }
        catch (SecurityTokenException ex)
        {
            logger.LogWarning(ex, "Auth0 JWT validation failed");
            return null;
        }
    }

    private async Task<JsonWebKeySet> GetJwksAsync()
    {
        const string cacheKey = "auth0_jwks";
        if (cache.TryGetValue(cacheKey, out JsonWebKeySet? cached) && cached is not null)
            return cached;

        var client = httpClientFactory.CreateClient();
        var jwksJson = await client.GetFromJsonAsync<System.Text.Json.JsonElement>(
            $"https://{_opts.Domain}/.well-known/jwks.json");

        var jwks = new JsonWebKeySet(jwksJson.GetRawText());
        cache.Set(cacheKey, jwks, TimeSpan.FromHours(1));
        return jwks;
    }
}
