namespace GolfLeagueApi.Models;

public class HoleScore
{
    public Guid Id { get; set; }
    public Guid RoundId { get; set; }
    public Guid HoleId { get; set; }
    public int? Strokes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Round Round { get; set; } = null!;
    public Hole Hole { get; set; } = null!;
}
