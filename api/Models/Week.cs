namespace GolfLeagueApi.Models;

public enum WeekType { Regular, FunWeek, MakeupDay }

public class Week
{
    public Guid Id { get; set; }
    public Guid SeasonId { get; set; }
    public int WeekNumber { get; set; }
    public DateOnly StartDate { get; set; }
    public WeekType Type { get; set; } = WeekType.Regular;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Season Season { get; set; } = null!;
    public ICollection<Matchup> Matchups { get; set; } = [];
}
