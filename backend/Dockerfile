FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for better caching of restore layers
COPY ["MythosGraph.sln", "./"]
COPY ["src/MythosGraph.Api/MythosGraph.Api.csproj", "src/MythosGraph.Api/"]
COPY ["src/MythosGraph.Application/MythosGraph.Application.csproj", "src/MythosGraph.Application/"]
COPY ["src/MythosGraph.Domain/MythosGraph.Domain.csproj", "src/MythosGraph.Domain/"]
COPY ["src/MythosGraph.Infrastructure/MythosGraph.Infrastructure.csproj", "src/MythosGraph.Infrastructure/"]

RUN dotnet restore

# Copy all sources and build/publish
COPY src/ ./src/
WORKDIR "/src/src/MythosGraph.Api"
RUN dotnet publish "MythosGraph.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MythosGraph.Api.dll"]
