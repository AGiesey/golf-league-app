using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class GolferConfiguration : IEntityTypeConfiguration<Golfer>
{
    public void Configure(EntityTypeBuilder<Golfer> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(g => g.FirstName).IsRequired();
        builder.Property(g => g.LastName).IsRequired();
        builder.Property(g => g.Email).IsRequired();

        builder.HasOne(g => g.Course)
               .WithMany(c => c.Golfers)
               .HasForeignKey(g => g.CourseId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(g => new { g.CourseId, g.Email }).IsUnique();

        builder.HasIndex(g => new { g.CourseId, g.ExternalAuthId })
               .IsUnique()
               .HasFilter("external_auth_id IS NOT NULL");
    }
}
