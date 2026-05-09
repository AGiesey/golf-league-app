namespace GolfLeagueApi.Models;

public class PairingSlot
{
    public Guid Id { get; set; }
    public Guid PairingId { get; set; }
    public Guid LeagueMembershipId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Pairing Pairing { get; set; } = null!;
    public LeagueMembership LeagueMembership { get; set; } = null!;
}
