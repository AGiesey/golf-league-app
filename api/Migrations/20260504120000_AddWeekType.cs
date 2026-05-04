using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations;

public partial class AddWeekType : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "type",
            table: "weeks",
            type: "text",
            nullable: false,
            defaultValue: "Regular");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "type",
            table: "weeks");
    }
}
