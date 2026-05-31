using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachRelationSource;

public sealed class AttachRelationSourceCommandHandler(IEntityRepository repository) : IRequestHandler<AttachRelationSourceCommand>
{
    public async Task Handle(AttachRelationSourceCommand request, CancellationToken cancellationToken)
    {
        var source = await repository.UpsertSourceAsync(new Source
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.SourceSlug.Trim(),
            Title = request.Request.SourceSlug.Trim(),
            SourceType = SourceType.Other,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await repository.AddRelationSourceAsync(request.RelationId, source.Id, request.Request.Usage, cancellationToken);
    }
}
