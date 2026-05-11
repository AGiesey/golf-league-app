using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchupPairingSlot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "matchups",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    week_id = table.Column<Guid>(type: "uuid", nullable: false),
                    team_a_id = table.Column<Guid>(type: "uuid", nullable: false),
                    team_b_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_matchups", x => x.id);
                    table.ForeignKey(
                        name: "fk_matchups_league_memberships_created_by",
                        column: x => x.created_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_matchups_league_memberships_updated_by",
                        column: x => x.updated_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_matchups_teams_team_a_id",
                        column: x => x.team_a_id,
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_matchups_teams_team_b_id",
                        column: x => x.team_b_id,
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_matchups_weeks_week_id",
                        column: x => x.week_id,
                        principalTable: "weeks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pairings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    matchup_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tee_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pairings", x => x.id);
                    table.ForeignKey(
                        name: "fk_pairings_league_memberships_created_by",
                        column: x => x.created_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_pairings_league_memberships_updated_by",
                        column: x => x.updated_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_pairings_matchups_matchup_id",
                        column: x => x.matchup_id,
                        principalTable: "matchups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pairing_slots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    pairing_id = table.Column<Guid>(type: "uuid", nullable: false),
                    league_membership_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pairing_slots", x => x.id);
                    table.ForeignKey(
                        name: "fk_pairing_slots_league_memberships_league_membership_id",
                        column: x => x.league_membership_id,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_pairing_slots_pairings_pairing_id",
                        column: x => x.pairing_id,
                        principalTable: "pairings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_matchups_created_by",
                table: "matchups",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_matchups_team_a_id",
                table: "matchups",
                column: "team_a_id");

            migrationBuilder.CreateIndex(
                name: "ix_matchups_team_b_id",
                table: "matchups",
                column: "team_b_id");

            migrationBuilder.CreateIndex(
                name: "ix_matchups_updated_by",
                table: "matchups",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "ix_matchups_week_id",
                table: "matchups",
                column: "week_id");

            migrationBuilder.CreateIndex(
                name: "ix_pairing_slots_league_membership_id",
                table: "pairing_slots",
                column: "league_membership_id");

            migrationBuilder.CreateIndex(
                name: "ix_pairing_slots_pairing_id",
                table: "pairing_slots",
                column: "pairing_id");

            migrationBuilder.CreateIndex(
                name: "ix_pairings_created_by",
                table: "pairings",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_pairings_matchup_id",
                table: "pairings",
                column: "matchup_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_pairings_updated_by",
                table: "pairings",
                column: "updated_by");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "pairing_slots");
            migrationBuilder.DropTable(name: "pairings");
            migrationBuilder.DropTable(name: "matchups");
        }
    }
}
