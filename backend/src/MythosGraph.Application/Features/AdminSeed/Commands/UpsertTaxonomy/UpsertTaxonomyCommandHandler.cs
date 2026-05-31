using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertTaxonomy;

public sealed class UpsertTaxonomyCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertTaxonomyCommand, Guid>
{
    public async Task<Guid> Handle(UpsertTaxonomyCommand request, CancellationToken cancellationToken)
    {
        Guid? parentId = null;
        if (!string.IsNullOrWhiteSpace(request.Request.ParentSlug))
        {
            var parent = await repository.UpsertTaxonomyAsync(new Taxonomy
            {
                Id = Guid.NewGuid(),
                Slug = request.Request.ParentSlug.Trim(),
                Name = request.Request.ParentSlug.Trim(),
                Category = request.Request.Category,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            }, cancellationToken);
            parentId = parent.Id;
        }

        var taxonomy = new Taxonomy
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.Slug.Trim(),
            Name = request.Request.Name.Trim(),
            Category = request.Request.Category.Trim(),
            ParentId = parentId,
            Description = request.Request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertTaxonomyAsync(taxonomy, cancellationToken);
        return saved.Id;
    }
}
