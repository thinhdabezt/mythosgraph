using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityTranslation;

public sealed class UpsertEntityTranslationCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertEntityTranslationCommand, Guid>
{
    public async Task<Guid> Handle(UpsertEntityTranslationCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.EntitySlug, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity '{request.EntitySlug}' was not found.");

        var translation = new EntityTranslation
        {
            Id = Guid.NewGuid(),
            EntityId = entity.Id,
            LanguageCode = request.Request.LanguageCode.Trim().ToLowerInvariant(),
            Name = request.Request.Name.Trim(),
            Summary = request.Request.Summary,
            Description = request.Request.Description,
            Status = request.Request.Status,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertEntityTranslationAsync(translation, cancellationToken);
        return saved.Id;
    }
}
