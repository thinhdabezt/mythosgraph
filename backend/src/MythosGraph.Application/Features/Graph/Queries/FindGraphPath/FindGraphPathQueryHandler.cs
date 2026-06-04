using MediatR;
using MythosGraph.Application.Features.Graph.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Graph.Queries.FindGraphPath;

public sealed class FindGraphPathQueryHandler(IEntityRepository repository) : IRequestHandler<FindGraphPathQuery, GraphPathResponseDto?>
{
    public async Task<GraphPathResponseDto?> Handle(FindGraphPathQuery request, CancellationToken cancellationToken)
    {
        var maxDepth = Math.Clamp(request.MaxDepth, 1, 8);
        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        return await repository.FindGraphPathAsync(request.From.Trim(), request.To.Trim(), maxDepth, lang, cancellationToken);
    }
}
