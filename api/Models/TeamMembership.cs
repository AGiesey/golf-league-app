namespace GolfLeagueApi.Models;

public class TeamMembership
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid LeagueMembershipId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Team Team { get; set; } = null!;
    public LeagueMembership LeagueMembership { get; set; } = null!;
}
