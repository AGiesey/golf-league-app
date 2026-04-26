using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class LeagueMembershipConfiguration : IEntityTypeConfiguration<LeagueMembership>
{
    public void Configure(EntityTypeBuilder<LeagueMembership> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(m => m.Golfer)
               .WithMany(g => g.Memberships)
               .HasForeignKey(m => m.GolferId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Season)
               .WithMany(s => s.Memberships)
               .HasForeignKey(m => m.SeasonId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
