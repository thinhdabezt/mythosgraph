using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Commands.SoftDeleteEntity;

public sealed class SoftDeleteEntityCommandHandler(IEntityRepository repository) : MediatR.IRequestHandler<SoftDeleteEntityCommand>
{
    public async Task Handle(SoftDeleteEntityCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity with id '{request.Id}' was not found.");

        entity.Status = EntityStatus.Deleted;
        entity.DeletedAt = DateTimeOffset.UtcNow;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.UpdateAsync(entity, cancellationToken);
    }
}
