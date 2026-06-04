using System.Text.RegularExpressions;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Common;

public static partial class RelationTypeFormatter
{
    public static string ToSnakeCase(RelationType relationType)
    {
        return PascalCaseBoundaryRegex()
            .Replace(relationType.ToString(), "_$1")
            .Trim('_')
            .ToLowerInvariant();
    }

    [GeneratedRegex("([A-Z])")]
    private static partial Regex PascalCaseBoundaryRegex();
}
