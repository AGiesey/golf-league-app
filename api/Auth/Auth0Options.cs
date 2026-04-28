namespace GolfLeagueApi.Auth;

public record Auth0Options
{
    public string Domain { get; set; } = "";
    public string Audience { get; set; } = "";
}
