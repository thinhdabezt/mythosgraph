using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityAlias;

public sealed class UpsertEntityAliasCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertEntityAliasCommand, Guid>
{
    public async Task<Guid> Handle(UpsertEntityAliasCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var alias = new EntityAlias
        {
            Id = Guid.NewGuid(),
            EntityId = entity.Id,
            Alias = request.Request.Alias.Trim(),
            LanguageCode = request.Request.LanguageCode?.Trim().ToLowerInvariant(),
            AliasType = request.Request.AliasType,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertEntityAliasAsync(alias, cancellationToken);
        return saved.Id;
    }
}
