using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class HoleConfiguration : IEntityTypeConfiguration<Hole>
{
    public void Configure(EntityTypeBuilder<Hole> builder)
    {
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.HasOne(h => h.Course)
               .WithMany(c => c.Holes)
               .HasForeignKey(h => h.CourseId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
