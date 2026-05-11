using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class PairingConfiguration : IEntityTypeConfiguration<Pairing>
{
    public void Configure(EntityTypeBuilder<Pairing> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(p => p.Matchup)
               .WithOne(m => m.Pairing)
               .HasForeignKey<Pairing>(p => p.MatchupId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.MatchupId).IsUnique();

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(p => p.CreatedBy)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(p => p.UpdatedBy)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
