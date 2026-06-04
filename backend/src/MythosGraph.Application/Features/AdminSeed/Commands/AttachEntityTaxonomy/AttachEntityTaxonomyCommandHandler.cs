using MediatR;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntityTaxonomy;

public sealed class AttachEntityTaxonomyCommandHandler(IEntityRepository repository) : IRequestHandler<AttachEntityTaxonomyCommand>
{
    public async Task Handle(AttachEntityTaxonomyCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var taxonomy = await repository.GetTaxonomyBySlugAsync(request.Request.TaxonomySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Taxonomy '{request.Request.TaxonomySlug}' was not found.");

        await repository.AddEntityTaxonomyAsync(entity.Id, taxonomy.Id, cancellationToken);
    }
}
