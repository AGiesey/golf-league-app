using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GolfLeagueApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Ping> Pings => Set<Ping>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ping>(b =>
        {
            b.ToTable("pings");
            b.Property(p => p.Id).HasColumnName("id");
            b.Property(p => p.CreatedAt).HasColumnName("created_at");
        });
    }
}
