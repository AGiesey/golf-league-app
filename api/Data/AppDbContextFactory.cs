using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GolfLeagueApi.Data;

// Used by `dotnet ef` CLI at design time (no running database required).
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=designtime;Username=designtime;Password=designtime")
            .Options;
        return new AppDbContext(options);
    }
}
