using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Commands.CreateEntity;

public sealed record CreateEntityCommand(CreateEntityRequest Request) : IRequest<Guid>;
