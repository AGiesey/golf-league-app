using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(t => t.Season)
               .WithMany(s => s.Teams)
               .HasForeignKey(t => t.SeasonId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
