using System.Text.Json;
using MediatR;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Relations.Commands.UpdateRelation;

public sealed class UpdateRelationCommandHandler(IEntityRepository repository) : IRequestHandler<UpdateRelationCommand>
{
    public async Task Handle(UpdateRelationCommand request, CancellationToken cancellationToken)
    {
        var relation = await repository.GetRelationByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Relation with id '{request.Id}' was not found.");

        var source = await repository.GetByIdAsync(request.Request.SourceEntityId, cancellationToken)
            ?? throw new KeyNotFoundException($"Source entity with id '{request.Request.SourceEntityId}' was not found.");

        var target = await repository.GetByIdAsync(request.Request.TargetEntityId, cancellationToken)
            ?? throw new KeyNotFoundException($"Target entity with id '{request.Request.TargetEntityId}' was not found.");

        relation.SourceEntityId = request.Request.SourceEntityId;
        relation.TargetEntityId = request.Request.TargetEntityId;
        relation.RelationType = request.Request.RelationType;
        relation.MetadataJson = request.Request.Metadata.HasValue 
            ? JsonSerializer.Serialize(request.Request.Metadata.Value) 
            : request.Request.MetadataJson;
        relation.Status = request.Request.Status;
        relation.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.UpdateRelationAsync(relation, cancellationToken);
    }
}
