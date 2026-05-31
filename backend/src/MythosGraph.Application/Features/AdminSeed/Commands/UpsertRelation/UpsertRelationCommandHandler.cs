using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertRelation;

public sealed class UpsertRelationCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertRelationCommand, Guid>
{
    public async Task<Guid> Handle(UpsertRelationCommand request, CancellationToken cancellationToken)
    {
        var source = await repository.GetBySlugEntityAsync(request.Request.SourceSlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.Request.SourceSlug}' was not found.");
        var target = await repository.GetBySlugEntityAsync(request.Request.TargetSlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.Request.TargetSlug}' was not found.");

        var relation = new GraphRelation
        {
            Id = Guid.NewGuid(),
            SourceEntityId = source.Id,
            TargetEntityId = target.Id,
            RelationType = request.Request.RelationType,
            MetadataJson = request.Request.MetadataJson,
            Status = request.Request.Status,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertRelationAsync(relation, cancellationToken);
        return saved.Id;
    }
}
