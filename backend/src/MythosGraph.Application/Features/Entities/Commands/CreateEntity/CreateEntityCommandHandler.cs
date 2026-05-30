using FluentValidation;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.Entities.Commands.CreateEntity;

public sealed class CreateEntityCommandHandler(IEntityRepository repository) : MediatR.IRequestHandler<CreateEntityCommand, Guid>
{
    public async Task<Guid> Handle(CreateEntityCommand request, CancellationToken cancellationToken)
    {
        var validator = new Validators.CreateEntityRequestValidator(repository);
        var validation = await validator.ValidateAsync(request.Request, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.Errors);
        }

        var entity = new GraphEntity
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.Slug.Trim(),
            Name = request.Request.Name.Trim(),
            EntityType = request.Request.EntityType,
            TraditionId = request.Request.TraditionId,
            Summary = request.Request.Summary,
            MetadataJson = request.Request.MetadataJson,
            Status = request.Request.Status,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await repository.AddAsync(entity, cancellationToken);
        return entity.Id;
    }
}
