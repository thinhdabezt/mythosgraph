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
        var timeoutMilliseconds = request.TimeoutMilliseconds <= 0 ? 500 : request.TimeoutMilliseconds;

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromMilliseconds(timeoutMilliseconds));

        try
        {
            return await repository.FindGraphPathAsync(request.From.Trim(), request.To.Trim(), maxDepth, lang, timeoutCts.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested && timeoutCts.IsCancellationRequested)
        {
            throw new TimeoutException($"Graph pathfinding exceeded {timeoutMilliseconds}ms timeout.");
        }
    }
}
