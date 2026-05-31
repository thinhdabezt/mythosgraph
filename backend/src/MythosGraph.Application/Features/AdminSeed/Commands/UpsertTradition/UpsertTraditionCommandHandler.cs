using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertTradition;

public sealed class UpsertTraditionCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertTraditionCommand, Guid>
{
    public async Task<Guid> Handle(UpsertTraditionCommand request, CancellationToken cancellationToken)
    {
        var model = new Tradition
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.Slug.Trim(),
            Name = request.Request.Name.Trim(),
            Region = request.Request.Region,
            Description = request.Request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertTraditionAsync(model, cancellationToken);
        return saved.Id;
    }
}
