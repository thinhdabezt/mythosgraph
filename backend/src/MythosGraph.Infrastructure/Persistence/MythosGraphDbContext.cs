using Microsoft.EntityFrameworkCore;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Infrastructure.Persistence;

public class MythosGraphDbContext(DbContextOptions<MythosGraphDbContext> options) : DbContext(options)
{
    public DbSet<EntityAlias> EntityAliases => Set<EntityAlias>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EntitySource> EntitySources => Set<EntitySource>();
    public DbSet<EntityTaxonomy> EntityTaxonomies => Set<EntityTaxonomy>();
    public DbSet<EntityTranslation> EntityTranslations => Set<EntityTranslation>();
    public DbSet<GraphEntity> GraphEntities => Set<GraphEntity>();
    public DbSet<GraphRelation> GraphRelations => Set<GraphRelation>();
    public DbSet<RelationSourceReference> RelationSourceReferences => Set<RelationSourceReference>();
    public DbSet<Source> Sources => Set<Source>();
    public DbSet<Taxonomy> Taxonomies => Set<Taxonomy>();
    public DbSet<Tradition> Traditions => Set<Tradition>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EntityTaxonomy>()
            .HasKey(x => new { x.EntityId, x.TaxonomyId });

        modelBuilder.Entity<EntitySource>()
            .HasKey(x => new { x.EntityId, x.SourceId });

        modelBuilder.Entity<RelationSourceReference>()
            .HasKey(x => new { x.RelationId, x.SourceId });

        modelBuilder.Entity<EntityTranslation>()
            .HasIndex(x => new { x.EntityId, x.LanguageCode })
            .IsUnique();

        modelBuilder.Entity<EntityAlias>()
            .HasIndex(x => new { x.EntityId, x.Alias })
            .IsUnique();

        modelBuilder.Entity<Source>()
            .HasIndex(x => x.Slug)
            .IsUnique()
            .HasFilter("\"Slug\" IS NOT NULL");

        modelBuilder.Entity<GraphEntity>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
