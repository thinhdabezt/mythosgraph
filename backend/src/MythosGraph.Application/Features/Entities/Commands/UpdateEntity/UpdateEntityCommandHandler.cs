using System.Text.Json;
using FluentValidation;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Commands.UpdateEntity;

public sealed class UpdateEntityCommandHandler(IEntityRepository repository) : MediatR.IRequestHandler<UpdateEntityCommand>
{
    public async Task Handle(UpdateEntityCommand request, CancellationToken cancellationToken)
    {
        var validator = new Validators.UpdateEntityRequestValidator(repository, request.Id);
        var validation = await validator.ValidateAsync(request.Request, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.Errors);
        }

        var entity = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Entity with id '{request.Id}' was not found.");

        var traditionId = request.Request.TraditionId;
        if (!string.IsNullOrWhiteSpace(request.Request.TraditionSlug))
        {
            var tradition = await repository.GetTraditionBySlugAsync(request.Request.TraditionSlug, cancellationToken)
                ?? throw new KeyNotFoundException($"Tradition '{request.Request.TraditionSlug}' was not found.");
            traditionId = tradition.Id;
        }

        entity.Slug = request.Request.Slug.Trim();
        entity.Name = request.Request.Name.Trim();
        entity.EntityType = request.Request.EntityType;
        entity.TraditionId = traditionId;
        entity.Summary = request.Request.Summary;
        entity.MetadataJson = request.Request.Metadata.HasValue ? JsonSerializer.Serialize(request.Request.Metadata.Value) : request.Request.MetadataJson;
        entity.Status = request.Request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.UpdateAsync(entity, cancellationToken);
    }
}
