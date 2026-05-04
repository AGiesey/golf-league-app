namespace GolfLeagueApi.Models;

public class Week
{
    public Guid Id { get; set; }
    public Guid SeasonId { get; set; }
    public int WeekNumber { get; set; }
    public DateOnly StartDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Season Season { get; set; } = null!;
}
