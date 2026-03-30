using Microsoft.EntityFrameworkCore;

namespace GolfLeagueApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
