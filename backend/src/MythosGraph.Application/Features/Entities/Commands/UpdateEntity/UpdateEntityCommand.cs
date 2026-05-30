using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Commands.UpdateEntity;

public sealed record UpdateEntityCommand(Guid Id, UpdateEntityRequest Request) : IRequest;
