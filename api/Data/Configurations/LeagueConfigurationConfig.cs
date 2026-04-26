using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class LeagueConfigurationConfig : IEntityTypeConfiguration<LeagueConfiguration>
{
    public void Configure(EntityTypeBuilder<LeagueConfiguration> builder)
    {
        builder.HasKey(lc => lc.Id);
        builder.Property(lc => lc.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(lc => lc.HandicapSystem).IsRequired();

        builder.HasOne(lc => lc.League)
               .WithOne(l => l.Configuration)
               .HasForeignKey<LeagueConfiguration>(lc => lc.LeagueId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
