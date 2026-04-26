namespace GolfLeagueApi.Models;

public class Course
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Timezone { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TeeBox> TeeBoxes { get; set; } = [];
    public ICollection<Hole> Holes { get; set; } = [];
    public ICollection<League> Leagues { get; set; } = [];
    public ICollection<Golfer> Golfers { get; set; } = [];
}
