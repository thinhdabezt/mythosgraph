using MediatR;
using MythosGraph.Application.Features.Graph.DTOs;

namespace MythosGraph.Application.Features.Graph.Queries.FindGraphPath;

public sealed record FindGraphPathQuery(string From, string To, int MaxDepth, string? Lang) : IRequest<GraphPathResponseDto?>;
