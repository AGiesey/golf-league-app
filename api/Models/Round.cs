namespace GolfLeagueApi.Models;

public class Round
{
    public Guid Id { get; set; }
    public Guid PairingSlotId { get; set; }
    public Guid? LeagueMembershipId { get; set; }
    public Guid? SubId { get; set; }
    public Guid TeeBoxId { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public PairingSlot PairingSlot { get; set; } = null!;
    public LeagueMembership? LeagueMembership { get; set; }
    public Sub? Sub { get; set; }
    public TeeBox TeeBox { get; set; } = null!;
    public ICollection<HoleScore> HoleScores { get; set; } = [];
}
