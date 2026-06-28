FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for better caching of restore layers
COPY ["backend/MythosGraph.sln", "backend/"]
COPY ["backend/src/MythosGraph.Api/MythosGraph.Api.csproj", "backend/src/MythosGraph.Api/"]
COPY ["backend/src/MythosGraph.Application/MythosGraph.Application.csproj", "backend/src/MythosGraph.Application/"]
COPY ["backend/src/MythosGraph.Domain/MythosGraph.Domain.csproj", "backend/src/MythosGraph.Domain/"]
COPY ["backend/src/MythosGraph.Infrastructure/MythosGraph.Infrastructure.csproj", "backend/src/MythosGraph.Infrastructure/"]

RUN dotnet restore "backend/MythosGraph.sln"

# Copy all sources and build/publish
COPY backend/src/ ./backend/src/
WORKDIR "/src/backend/src/MythosGraph.Api"
RUN dotnet publish "MythosGraph.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MythosGraph.Api.dll"]
