using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntityTaxonomy;

public sealed class AttachEntityTaxonomyCommandHandler(IEntityRepository repository) : IRequestHandler<AttachEntityTaxonomyCommand>
{
    public async Task Handle(AttachEntityTaxonomyCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var taxonomy = await repository.UpsertTaxonomyAsync(new Taxonomy
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.TaxonomySlug.Trim(),
            Name = request.Request.TaxonomySlug.Trim(),
            Category = "general",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await repository.AddEntityTaxonomyAsync(entity.Id, taxonomy.Id, cancellationToken);
    }
}
