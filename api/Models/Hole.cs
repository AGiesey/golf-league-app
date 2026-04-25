namespace GolfLeagueApi.Models;

public class Hole
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public int Number { get; set; }
    public int Par { get; set; }
    public int HandicapIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Course Course { get; set; } = null!;
}
