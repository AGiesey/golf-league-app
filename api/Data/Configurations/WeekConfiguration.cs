using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class WeekConfiguration : IEntityTypeConfiguration<Week>
{
    public void Configure(EntityTypeBuilder<Week> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.Property(w => w.Type)
               .HasConversion<string>()
               .HasDefaultValue(WeekType.Regular);

        builder.Property(w => w.Nine)
               .HasConversion<string>()
               .HasDefaultValue(NineType.Front);

        builder.HasOne(w => w.Season)
               .WithMany(s => s.Weeks)
               .HasForeignKey(w => w.SeasonId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
