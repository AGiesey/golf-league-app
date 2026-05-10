using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GolfLeagueApi.Data.Configurations;

public class SubConfiguration : IEntityTypeConfiguration<Sub>
{
    public void Configure(EntityTypeBuilder<Sub> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(s => s.FirstName).IsRequired();
        builder.Property(s => s.LastName).IsRequired();
    }
}
