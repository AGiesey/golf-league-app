using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class LeagueEntityConfiguration : IEntityTypeConfiguration<League>
{
    public void Configure(EntityTypeBuilder<League> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(l => l.Name).IsRequired();

        builder.HasOne(l => l.Course)
               .WithMany(c => c.Leagues)
               .HasForeignKey(l => l.CourseId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
