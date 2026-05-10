using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations;

public partial class AddDefaultTeeBoxId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "default_tee_box_id",
            table: "league_configurations",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_league_configurations_default_tee_box_id",
            table: "league_configurations",
            column: "default_tee_box_id");

        migrationBuilder.AddForeignKey(
            name: "fk_league_configurations_tee_boxes_default_tee_box_id",
            table: "league_configurations",
            column: "default_tee_box_id",
            principalTable: "tee_boxes",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_league_configurations_tee_boxes_default_tee_box_id",
            table: "league_configurations");

        migrationBuilder.DropIndex(
            name: "ix_league_configurations_default_tee_box_id",
            table: "league_configurations");

        migrationBuilder.DropColumn(
            name: "default_tee_box_id",
            table: "league_configurations");
    }
}
