namespace GolfLeagueApi.Models;

public class Team
{
    public Guid Id { get; set; }
    public Guid SeasonId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Season Season { get; set; } = null!;
    public ICollection<TeamMembership> TeamMemberships { get; set; } = [];
}
