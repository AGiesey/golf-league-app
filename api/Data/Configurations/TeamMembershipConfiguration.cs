using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class TeamMembershipConfiguration : IEntityTypeConfiguration<TeamMembership>
{
    public void Configure(EntityTypeBuilder<TeamMembership> builder)
    {
        builder.HasKey(tm => tm.Id);
        builder.Property(tm => tm.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(tm => tm.Team)
               .WithMany(t => t.TeamMemberships)
               .HasForeignKey(tm => tm.TeamId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(tm => tm.LeagueMembership)
               .WithOne(m => m.TeamMembership)
               .HasForeignKey<TeamMembership>(tm => tm.LeagueMembershipId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
