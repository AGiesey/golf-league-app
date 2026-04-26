namespace GolfLeagueApi.Models;

public class Golfer
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ExternalAuthId { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Course Course { get; set; } = null!;
    public ICollection<LeagueMembership> Memberships { get; set; } = [];
}
