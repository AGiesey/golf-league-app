namespace GolfLeagueApi.Models;

public class League
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = null!;
    public DayOfWeek DayOfWeek { get; set; }
    public int DefaultRoundLength { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Course Course { get; set; } = null!;
    public LeagueConfiguration? Configuration { get; set; }
    public ICollection<Season> Seasons { get; set; } = [];
}
