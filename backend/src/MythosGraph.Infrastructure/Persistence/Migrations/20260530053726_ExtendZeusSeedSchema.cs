using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MythosGraph.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExtendZeusSeedSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Sources",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EntityAliases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Alias = table.Column<string>(type: "text", nullable: false),
                    LanguageCode = table.Column<string>(type: "text", nullable: true),
                    AliasType = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityAliases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EntityTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    LanguageCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityTranslations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RelationSourceReferences",
                columns: table => new
                {
                    RelationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Usage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelationSourceReferences", x => new { x.RelationId, x.SourceId });
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sources_Slug",
                table: "Sources",
                column: "Slug",
                unique: true,
                filter: "\"Slug\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EntityAliases_EntityId_Alias",
                table: "EntityAliases",
                columns: new[] { "EntityId", "Alias" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EntityTranslations_EntityId_LanguageCode",
                table: "EntityTranslations",
                columns: new[] { "EntityId", "LanguageCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntityAliases");

            migrationBuilder.DropTable(
                name: "EntityTranslations");

            migrationBuilder.DropTable(
                name: "RelationSourceReferences");

            migrationBuilder.DropIndex(
                name: "IX_Sources_Slug",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Sources");
        }
    }
}
