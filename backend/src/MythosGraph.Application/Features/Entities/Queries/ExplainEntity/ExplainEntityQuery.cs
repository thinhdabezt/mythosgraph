using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.ExplainEntity;

public sealed record ExplainEntityQuery(string Slug, string? Lang = null) : IRequest<EntityExplainDto?>;
