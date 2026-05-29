using Microsoft.EntityFrameworkCore;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Infrastructure.Persistence;

public class MythosGraphDbContext(DbContextOptions<MythosGraphDbContext> options) : DbContext(options)
{
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EntitySource> EntitySources => Set<EntitySource>();
    public DbSet<EntityTaxonomy> EntityTaxonomies => Set<EntityTaxonomy>();
    public DbSet<GraphEntity> GraphEntities => Set<GraphEntity>();
    public DbSet<GraphRelation> GraphRelations => Set<GraphRelation>();
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

        base.OnModelCreating(modelBuilder);
    }
}
