using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GolfLeagueApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamArchivedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "archived_at",
                table: "teams",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "archived_at",
                table: "teams");
        }
    }
}
