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

        entity.Slug = request.Request.Slug.Trim();
        entity.Name = request.Request.Name.Trim();
        entity.EntityType = request.Request.EntityType;
        entity.TraditionId = request.Request.TraditionId;
        entity.Summary = request.Request.Summary;
        entity.MetadataJson = request.Request.MetadataJson;
        entity.Status = request.Request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.UpdateAsync(entity, cancellationToken);
    }
}
