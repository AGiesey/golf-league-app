using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class PairingSlotConfiguration : IEntityTypeConfiguration<PairingSlot>
{
    public void Configure(EntityTypeBuilder<PairingSlot> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(s => s.Pairing)
               .WithMany(p => p.PairingSlots)
               .HasForeignKey(s => s.PairingId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.LeagueMembership)
               .WithMany()
               .HasForeignKey(s => s.LeagueMembershipId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
