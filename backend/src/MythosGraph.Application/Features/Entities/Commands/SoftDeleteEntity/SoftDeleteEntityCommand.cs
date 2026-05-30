using MediatR;

namespace MythosGraph.Application.Features.Entities.Commands.SoftDeleteEntity;

public sealed record SoftDeleteEntityCommand(Guid Id) : IRequest;
