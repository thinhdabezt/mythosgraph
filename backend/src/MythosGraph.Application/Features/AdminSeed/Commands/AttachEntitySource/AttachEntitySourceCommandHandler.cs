using MediatR;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntitySource;

public sealed class AttachEntitySourceCommandHandler(IEntityRepository repository) : IRequestHandler<AttachEntitySourceCommand>
{
    public async Task Handle(AttachEntitySourceCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var source = await repository.GetSourceBySlugAsync(request.Request.SourceSlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Source '{request.Request.SourceSlug}' was not found.");

        await repository.AddEntitySourceAsync(entity.Id, source.Id, request.Request.Usage, cancellationToken);
    }
}
