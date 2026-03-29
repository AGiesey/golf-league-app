# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY GolfLeagueApi.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "GolfLeagueApi.dll"]

# ── Development stage (future use) ───────────────────────────────────────────
# FROM mcr.microsoft.com/dotnet/sdk:9.0 AS development
# WORKDIR /src
# COPY . .
# EXPOSE 8080
# ENV ASPNETCORE_URLS=http://+:8080
# ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile"]
