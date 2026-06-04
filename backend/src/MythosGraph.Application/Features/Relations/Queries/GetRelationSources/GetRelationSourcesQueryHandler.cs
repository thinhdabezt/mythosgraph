using MediatR;
using MythosGraph.Application.Features.Relations.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Relations.Queries.GetRelationSources;

public sealed class GetRelationSourcesQueryHandler(IEntityRepository repository) : IRequestHandler<GetRelationSourcesQuery, RelationSourcesDto?>
{
    public async Task<RelationSourcesDto?> Handle(GetRelationSourcesQuery request, CancellationToken cancellationToken)
    {
        var exists = await repository.RelationExistsAsync(request.RelationId, cancellationToken);
        if (!exists) return null;

        var sources = await repository.GetSourcesByRelationIdAsync(request.RelationId, cancellationToken);
        return new RelationSourcesDto(request.RelationId, sources);
    }
}
