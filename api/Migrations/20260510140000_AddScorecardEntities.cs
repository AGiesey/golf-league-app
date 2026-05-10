using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations
{
    /// <inheritdoc />
    public partial class AddScorecardEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "subs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    first_name = table.Column<string>(type: "text", nullable: false),
                    last_name = table.Column<string>(type: "text", nullable: false),
                    handicap = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rounds",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    pairing_slot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    league_membership_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sub_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tee_box_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rounds", x => x.id);
                    table.ForeignKey(
                        name: "fk_rounds_league_memberships_created_by",
                        column: x => x.created_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_rounds_league_memberships_league_membership_id",
                        column: x => x.league_membership_id,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_rounds_league_memberships_updated_by",
                        column: x => x.updated_by,
                        principalTable: "league_memberships",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_rounds_pairing_slots_pairing_slot_id",
                        column: x => x.pairing_slot_id,
                        principalTable: "pairing_slots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_rounds_subs_sub_id",
                        column: x => x.sub_id,
                        principalTable: "subs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_rounds_tee_boxes_tee_box_id",
                        column: x => x.tee_box_id,
                        principalTable: "tee_boxes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "hole_scores",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    round_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hole_id = table.Column<Guid>(type: "uuid", nullable: false),
                    strokes = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hole_scores", x => x.id);
                    table.ForeignKey(
                        name: "fk_hole_scores_holes_hole_id",
                        column: x => x.hole_id,
                        principalTable: "holes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hole_scores_rounds_round_id",
                        column: x => x.round_id,
                        principalTable: "rounds",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_rounds_created_by",
                table: "rounds",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_rounds_league_membership_id",
                table: "rounds",
                column: "league_membership_id");

            migrationBuilder.CreateIndex(
                name: "ix_rounds_pairing_slot_id",
                table: "rounds",
                column: "pairing_slot_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rounds_sub_id",
                table: "rounds",
                column: "sub_id");

            migrationBuilder.CreateIndex(
                name: "ix_rounds_tee_box_id",
                table: "rounds",
                column: "tee_box_id");

            migrationBuilder.CreateIndex(
                name: "ix_rounds_updated_by",
                table: "rounds",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "ix_hole_scores_hole_id",
                table: "hole_scores",
                column: "hole_id");

            migrationBuilder.CreateIndex(
                name: "ix_hole_scores_round_id_hole_id",
                table: "hole_scores",
                columns: new[] { "round_id", "hole_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "hole_scores");
            migrationBuilder.DropTable(name: "rounds");
            migrationBuilder.DropTable(name: "subs");
        }
    }
}
