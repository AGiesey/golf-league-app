## 1. Data model — WeekType enum and Week.Type property

- [x] 1.1 Add `WeekType` enum to `api/Models/Week.cs`:
  ```csharp
  public enum WeekType { Regular, FunWeek, MakeupDay }
  ```
  Add `public WeekType Type { get; set; } = WeekType.Regular;` as a property on the `Week` class

- [x] 1.2 Update `api/Data/Configurations/WeekConfiguration.cs` to configure the `Type` column:
  ```csharp
  builder.Property(w => w.Type)
         .HasConversion<string>()
         .HasDefaultValue(WeekType.Regular);
  ```

## 2. EF Core migration — add type column to weeks

- [x] 2.1 Create `api/Migrations/20260504120000_AddWeekType.cs` with `Up` adding the column and `Down` dropping it:
  ```csharp
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
  ```

- [x] 2.2 Create `api/Migrations/20260504120000_AddWeekType.Designer.cs` — required for EF Core to recognise the migration (copy the `BuildTargetModel` from `AppDbContextModelSnapshot.cs`, add the `Type` property to the `Week` entity block, and tag with `[Migration("20260504120000_AddWeekType")]`)

- [x] 2.3 Update `api/Migrations/AppDbContextModelSnapshot.cs` — add the `Type` property to the `GolfLeagueApi.Models.Week` entity block:
  ```csharp
  b.Property<string>("Type")
      .HasColumnType("text")
      .HasColumnName("type");
  ```
  (Insert after the `StartDate` property block)

## 3. API — GET /commissioner/season/schedule endpoint

- [x] 3.1 Add `GET /commissioner/season/schedule` to the commissioner route group in `api/Program.cs`: query `db.Weeks` where `SeasonId == membership.SeasonId`, order by `WeekNumber`, return array of `{ id, weekNumber, startDate, type }`:
  ```csharp
  commissioner.MapGet("/season/schedule", async (HttpContext ctx, AppDbContext db) =>
  {
      var membership = (LeagueMembership)ctx.Items["ActiveMembership"]!;
      var weeks = await db.Weeks
          .Where(w => w.SeasonId == membership.SeasonId)
          .OrderBy(w => w.WeekNumber)
          .Select(w => new
          {
              id = w.Id,
              weekNumber = w.WeekNumber,
              startDate = w.StartDate,
              type = w.Type.ToString()
          })
          .ToListAsync();
      return Results.Ok(weeks);
  });
  ```

## 4. Web — ScheduleTab component

- [x] 4.1 Create `web/app/(app)/commissioner/season/ScheduleTab.tsx` as a `"use client"` component: accepts `membershipId: string` and `token: string` as props, fetches `GET /commissioner/season/schedule` on mount with `X-Membership-Id` and `Authorization` headers

- [x] 4.2 Implement loading and error states: show a loading message while the fetch is in flight; show an error message if the fetch fails

- [x] 4.3 Implement the empty state: when the fetched array is empty, render a card or styled paragraph with the message "Your schedule hasn't been set up yet. Contact your course admin to get your weeks added." No action buttons

- [x] 4.4 Implement the week table: when the array is non-empty, render a `<table>` with columns for Week #, Date (formatted as a readable date string, e.g. "Mon, Apr 7 2026"), and Type; each row is read-only with no edit or delete controls

## 5. Web — Wire ScheduleTab into SeasonTabs

- [x] 5.1 Update `web/app/(app)/commissioner/season/SeasonTabs.tsx`: import `ScheduleTab`, replace the Schedule tab placeholder content with `<ScheduleTab membershipId={membershipId} token={token} />`

## 6. Build and restart

- [x] 6.1 Build the API Docker image and restart the container so the migration runs on startup: `docker compose build api && docker compose up -d api`

## 7. Verify

- [x] 7.1 Navigate to `/commissioner/season?tab=schedule` — if no weeks exist, confirm the empty state message renders with no action controls
- [x] 7.2 Insert a week via SQL (`INSERT INTO weeks ...`) and reload — confirm the table renders with the correct week number, date, and type
- [x] 7.3 Confirm `GET /commissioner/season/schedule` returns 403 when called with a non-commissioner token
- [x] 7.4 Confirm the Roster and Teams tabs still render correctly (no regression)
- [x] 7.5 Confirm the Schedule tab indicator in the tab bar changes to a checkmark after a week is added (setup requirement met)
