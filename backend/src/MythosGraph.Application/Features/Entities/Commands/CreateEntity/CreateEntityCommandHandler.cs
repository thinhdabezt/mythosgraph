using System.Text.Json;
using FluentValidation;
using FluentValidation.Results;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Commands.CreateEntity;

public sealed class CreateEntityCommandHandler(IEntityRepository repository) : MediatR.IRequestHandler<CreateEntityCommand, Guid>
{
    public async Task<Guid> Handle(CreateEntityCommand request, CancellationToken cancellationToken)
    {
        var existing = await repository.GetBySlugEntityAsync(request.Request.Slug, cancellationToken);
        if (existing is null)
        {
            var validator = new Validators.CreateEntityRequestValidator(repository);
            var validation = await validator.ValidateAsync(request.Request, cancellationToken);
            if (!validation.IsValid)
            {
                throw new ValidationException(validation.Errors);
            }
        }
        else
        {
            ValidateExistingUpsert(request.Request);
        }

        var traditionId = request.Request.TraditionId;
        if (!string.IsNullOrWhiteSpace(request.Request.TraditionSlug))
        {
            var tradition = await repository.GetTraditionBySlugAsync(request.Request.TraditionSlug, cancellationToken)
                ?? throw new KeyNotFoundException($"Tradition '{request.Request.TraditionSlug}' was not found.");
            traditionId = tradition.Id;
        }

        if (existing is not null)
        {
            existing.Name = request.Request.Name.Trim();
            existing.EntityType = request.Request.EntityType;
            existing.TraditionId = traditionId;
            existing.Summary = request.Request.Summary;
            existing.MetadataJson = request.Request.Metadata.HasValue ? JsonSerializer.Serialize(request.Request.Metadata.Value) : request.Request.MetadataJson;
            existing.Status = request.Request.Status;
            existing.UpdatedAt = DateTimeOffset.UtcNow;
            await repository.UpdateAsync(existing, cancellationToken);
            return existing.Id;
        }

        var entity = new GraphEntity
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.Slug.Trim(),
            Name = request.Request.Name.Trim(),
            EntityType = request.Request.EntityType,
            TraditionId = traditionId,
            Summary = request.Request.Summary,
            MetadataJson = request.Request.Metadata.HasValue ? JsonSerializer.Serialize(request.Request.Metadata.Value) : request.Request.MetadataJson,
            Status = request.Request.Status,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        return entity.Id;
    }

    private static void ValidateExistingUpsert(DTOs.CreateEntityRequest request)
    {
        var failures = new List<ValidationFailure>();
        if (string.IsNullOrWhiteSpace(request.Slug))
        {
            failures.Add(new ValidationFailure(nameof(request.Slug), "Slug is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            failures.Add(new ValidationFailure(nameof(request.Name), "Name is required."));
        }

        if (!Enum.IsDefined(typeof(EntityType), request.EntityType))
        {
            failures.Add(new ValidationFailure(nameof(request.EntityType), "EntityType is invalid."));
        }

        if (request.Summary is { Length: > 1000 })
        {
            failures.Add(new ValidationFailure(nameof(request.Summary), "Summary must be 1000 characters or fewer."));
        }

        if (failures.Count > 0)
        {
            throw new ValidationException(failures);
        }
    }
}
