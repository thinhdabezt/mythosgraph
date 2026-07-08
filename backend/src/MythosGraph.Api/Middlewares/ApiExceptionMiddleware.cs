using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace MythosGraph.Api.Middlewares;

public sealed class ApiExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ValidationProblemDetails(
                ex.Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray()))
            {
                Title = "Validation failed"
            });
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new ProblemDetails { Title = "Not Found", Detail = ex.Message });
        }
        catch (TimeoutException ex)
        {
            context.Response.StatusCode = StatusCodes.Status408RequestTimeout;
            await context.Response.WriteAsJsonAsync(new ProblemDetails { Title = "Request Timeout", Detail = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ApiExceptionMiddleware] Unhandled exception: {ex}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new ProblemDetails 
            { 
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error", 
                Detail = ex.Message 
            });
        }
    }
}
