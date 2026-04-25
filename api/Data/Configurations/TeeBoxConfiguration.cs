using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class TeeBoxConfiguration : IEntityTypeConfiguration<TeeBox>
{
    public void Configure(EntityTypeBuilder<TeeBox> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(t => t.Name).IsRequired();

        builder.HasOne(t => t.Course)
               .WithMany(c => c.TeeBoxes)
               .HasForeignKey(t => t.CourseId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
