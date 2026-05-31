using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertSource;

public sealed class UpsertSourceCommandHandler(IEntityRepository repository) : IRequestHandler<UpsertSourceCommand, Guid>
{
    public async Task<Guid> Handle(UpsertSourceCommand request, CancellationToken cancellationToken)
    {
        var source = new Source
        {
            Id = Guid.NewGuid(),
            Slug = request.Request.Slug?.Trim(),
            Title = request.Request.Title.Trim(),
            Author = request.Request.Author,
            SourceType = request.Request.SourceType,
            Url = request.Request.Url,
            PublicationYear = request.Request.PublicationYear,
            Language = request.Request.Language,
            LicenseNote = request.Request.LicenseNote,
            Notes = request.Request.Notes,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await repository.UpsertSourceAsync(source, cancellationToken);
        return saved.Id;
    }
}
