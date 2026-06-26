using MediatR;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Relations.Commands.DeleteRelation;

public sealed class DeleteRelationCommandHandler(IEntityRepository repository) : IRequestHandler<DeleteRelationCommand>
{
    public async Task Handle(DeleteRelationCommand request, CancellationToken cancellationToken)
    {
        var exists = await repository.RelationExistsAsync(request.Id, cancellationToken);
        if (!exists)
        {
            throw new KeyNotFoundException($"Relation with id '{request.Id}' was not found.");
        }

        await repository.DeleteRelationAsync(request.Id, cancellationToken);
    }
}
