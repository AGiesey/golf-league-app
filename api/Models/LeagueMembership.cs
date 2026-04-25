namespace GolfLeagueApi.Models;

public class LeagueMembership
{
    public Guid Id { get; set; }
    public Guid GolferId { get; set; }
    public Guid SeasonId { get; set; }
    public decimal? Handicap { get; set; }
    public bool IsCommissioner { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Golfer Golfer { get; set; } = null!;
    public Season Season { get; set; } = null!;
}
