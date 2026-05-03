using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GolfLeagueApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GolfLeagueApi.Auth;

public class MockAuthProvider(
    IOptions<MockAuthOptions> options,
    AppDbContext db,
    ILogger<MockAuthProvider> logger) : IAuthProvider
{
    private readonly MockAuthOptions _opts = options.Value;

    public Task<AuthResult?> ValidateTokenAsync(string bearerToken)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.SigningKey));
        var handler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = "golf-league-mock",
            ValidateAudience = true,
            ValidAudience = "golf-league-api",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            handler.ValidateToken(bearerToken, validationParams, out var securityToken);
            var jwt = (JwtSecurityToken)securityToken;
            var sub = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var email = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value;

            if (sub is null || email is null)
            {
                logger.LogWarning("Mock JWT missing required claims: sub={SubPresent}, email={EmailPresent}",
                    sub is not null, email is not null);
                return Task.FromResult<AuthResult?>(null);
            }

            return Task.FromResult<AuthResult?>(new AuthResult(sub, email));
        }
        catch (SecurityTokenException ex)
        {
            logger.LogWarning(ex, "Mock JWT validation failed");
            return Task.FromResult<AuthResult?>(null);
        }
    }

    public async Task<string> IssueTokenAsync(Guid golferId)
    {
        var golfer = await db.Golfers.FirstOrDefaultAsync(g => g.Id == golferId && g.ArchivedAt == null)
            ?? throw new ArgumentException($"Golfer {golferId} not found.", nameof(golferId));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "golf-league-mock",
            audience: "golf-league-api",
            claims: [
                new Claim(JwtRegisteredClaimNames.Sub, $"mock|{golferId}"),
                new Claim(JwtRegisteredClaimNames.Email, golfer.Email)
            ],
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
