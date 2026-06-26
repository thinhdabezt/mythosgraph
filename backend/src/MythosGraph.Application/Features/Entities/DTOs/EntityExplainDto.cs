using System.Collections.Generic;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record ExplainEntityDetailDto(string Slug, string Name, string Type);

public sealed record EntityExplainDto(
    ExplainEntityDetailDto Entity,
    IReadOnlyCollection<string> Explanation,
    IReadOnlyCollection<string> GeneratedFromRelations
);
