using MediatR;
using MythosGraph.Application.Features.Traditions.DTOs;

namespace MythosGraph.Application.Features.Traditions.Queries.GetTraditionDetail;

public sealed record GetTraditionDetailQuery(string Slug) : IRequest<TraditionDetailDto?>;
