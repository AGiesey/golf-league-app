namespace GolfLeagueApi.Models;

public class Season
{
    public Guid Id { get; set; }
    public Guid LeagueId { get; set; }
    public int Year { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public League League { get; set; } = null!;
    public ICollection<LeagueMembership> Memberships { get; set; } = [];
}
