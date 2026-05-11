using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations;

public partial class AddWeekNine : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Default 'Front' is a safe dev default — no production rows exist.
        // Leagues that alternate front/back should update their seed SQL to set nine explicitly.
        migrationBuilder.AddColumn<string>(
            name: "nine",
            table: "weeks",
            type: "text",
            nullable: false,
            defaultValue: "Front");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "nine",
            table: "weeks");
    }
}
