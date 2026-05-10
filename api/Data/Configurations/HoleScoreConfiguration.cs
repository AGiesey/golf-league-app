using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class HoleScoreConfiguration : IEntityTypeConfiguration<HoleScore>
{
    public void Configure(EntityTypeBuilder<HoleScore> builder)
    {
        builder.HasKey(hs => hs.Id);
        builder.Property(hs => hs.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(hs => hs.Round)
               .WithMany(r => r.HoleScores)
               .HasForeignKey(hs => hs.RoundId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(hs => hs.Hole)
               .WithMany()
               .HasForeignKey(hs => hs.HoleId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(hs => new { hs.RoundId, hs.HoleId }).IsUnique();
    }
}
