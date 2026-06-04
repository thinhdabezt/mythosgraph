using MediatR;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachRelationSource;

public sealed class AttachRelationSourceCommandHandler(IEntityRepository repository) : IRequestHandler<AttachRelationSourceCommand>
{
    public async Task Handle(AttachRelationSourceCommand request, CancellationToken cancellationToken)
    {
        var source = await repository.GetSourceBySlugAsync(request.Request.SourceSlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Source '{request.Request.SourceSlug}' was not found.");

        await repository.AddRelationSourceAsync(request.RelationId, source.Id, request.Request.Usage, cancellationToken);
    }
}
