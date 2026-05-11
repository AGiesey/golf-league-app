using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class RoundConfiguration : IEntityTypeConfiguration<Round>
{
    public void Configure(EntityTypeBuilder<Round> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");

        // 1:1 with PairingSlot
        builder.HasOne(r => r.PairingSlot)
               .WithOne(s => s.Round)
               .HasForeignKey<Round>(r => r.PairingSlotId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.PairingSlotId).IsUnique();

        builder.HasOne(r => r.LeagueMembership)
               .WithMany()
               .HasForeignKey(r => r.LeagueMembershipId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Sub)
               .WithMany()
               .HasForeignKey(r => r.SubId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.TeeBox)
               .WithMany()
               .HasForeignKey(r => r.TeeBoxId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(r => r.CreatedBy)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(r => r.UpdatedBy)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
