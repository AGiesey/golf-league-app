namespace GolfLeagueApi.Models;

public class Pairing
{
    public Guid Id { get; set; }
    public Guid MatchupId { get; set; }
    public TimeOnly? TeeTime { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Matchup Matchup { get; set; } = null!;
    public ICollection<PairingSlot> PairingSlots { get; set; } = [];
}
