using MediatR;
using MythosGraph.Application.Features.Relations.DTOs;

namespace MythosGraph.Application.Features.Relations.Commands.UpdateRelation;

public sealed record UpdateRelationCommand(Guid Id, UpdateRelationRequest Request) : IRequest;
