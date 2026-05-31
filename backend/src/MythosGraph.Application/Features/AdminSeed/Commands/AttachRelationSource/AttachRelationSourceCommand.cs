using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachRelationSource;

public sealed record AttachRelationSourceCommand(Guid RelationId, AttachRelationSourceRequest Request) : IRequest;
