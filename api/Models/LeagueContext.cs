namespace GolfLeagueApi.Models;

public record LeagueContext(
    Guid GolferId,
    Guid LeagueMembershipId,
    Guid SeasonId,
    Guid LeagueId,
    Guid CourseId,
    bool IsCommissioner
);
