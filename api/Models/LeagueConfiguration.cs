namespace GolfLeagueApi.Models;

public class LeagueConfiguration
{
    public Guid Id { get; set; }
    public Guid LeagueId { get; set; }
    public string HandicapSystem { get; set; } = null!;
    public bool SubsAllowed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public League League { get; set; } = null!;
}
