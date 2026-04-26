using GolfLeagueApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GolfLeagueApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<TeeBox> TeeBoxes => Set<TeeBox>();
    public DbSet<Hole> Holes => Set<Hole>();
    public DbSet<League> Leagues => Set<League>();
    public DbSet<LeagueConfiguration> LeagueConfigurations => Set<LeagueConfiguration>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<Golfer> Golfers => Set<Golfer>();
    public DbSet<LeagueMembership> LeagueMemberships => Set<LeagueMembership>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
