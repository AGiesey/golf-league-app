namespace GolfLeagueApi.Models;

public class TeeBox
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Course Course { get; set; } = null!;
}
