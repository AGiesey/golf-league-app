using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class MatchupConfiguration : IEntityTypeConfiguration<Matchup>
{
    public void Configure(EntityTypeBuilder<Matchup> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(m => m.Week)
               .WithMany(w => w.Matchups)
               .HasForeignKey(m => m.WeekId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.TeamA)
               .WithMany()
               .HasForeignKey(m => m.TeamAId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.TeamB)
               .WithMany()
               .HasForeignKey(m => m.TeamBId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(m => m.CreatedBy)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<LeagueMembership>()
               .WithMany()
               .HasForeignKey(m => m.UpdatedBy)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
