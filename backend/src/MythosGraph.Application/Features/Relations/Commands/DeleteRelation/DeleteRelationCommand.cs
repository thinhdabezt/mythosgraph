using MediatR;

namespace MythosGraph.Application.Features.Relations.Commands.DeleteRelation;

public sealed record DeleteRelationCommand(Guid Id) : IRequest;
