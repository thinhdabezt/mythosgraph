using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntitySource;

public sealed class AttachEntitySourceCommandHandler(IEntityRepository repository) : IRequestHandler<AttachEntitySourceCommand>
{
    public async Task Handle(AttachEntitySourceCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var source = await repository.UpsertSourceAsync(new Source
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.SourceSlug.Trim(),
            Title = request.Request.SourceSlug.Trim(),
            SourceType = SourceType.Other,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await repository.AddEntitySourceAsync(entity.Id, source.Id, request.Request.Usage, cancellationToken);
    }
}
