using MediatR;
using MythosGraph.Application.Features.Relations.DTOs;

namespace MythosGraph.Application.Features.Relations.Queries.GetRelationSources;

public sealed record GetRelationSourcesQuery(Guid RelationId) : IRequest<RelationSourcesDto?>;
