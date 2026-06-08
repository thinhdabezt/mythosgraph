using System.Text.Json;

namespace MythosGraph.Application.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        Guid? userId,
        string action,
        string entityType,
        Guid entityId,
        JsonElement? newValue,
        string? oldValueJson,
        CancellationToken cancellationToken);
}
