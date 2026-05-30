using FluentValidation;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Validators;

public sealed class UpdateEntityRequestValidator : AbstractValidator<UpdateEntityRequest>
{
    public UpdateEntityRequestValidator(IEntityRepository repository, Guid entityId)
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .MustAsync(async (slug, ct) => !await repository.SlugExistsAsync(slug, entityId, ct))
            .WithMessage("Slug must be unique.");

        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.EntityType).IsInEnum();
        RuleFor(x => x.Summary).MaximumLength(1000);
    }
}
