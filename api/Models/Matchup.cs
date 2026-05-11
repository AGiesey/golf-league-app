namespace GolfLeagueApi.Models;

public class Matchup
{
    public Guid Id { get; set; }
    public Guid WeekId { get; set; }
    public Guid TeamAId { get; set; }
    public Guid TeamBId { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Week Week { get; set; } = null!;
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
    public Pairing Pairing { get; set; } = null!;
}
