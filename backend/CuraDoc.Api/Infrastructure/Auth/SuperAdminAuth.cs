using System.Security.Cryptography;
using System.Text;
using CuraDoc.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CuraDoc.Api.Infrastructure.Auth;

public static class SimpleTokenService
{
    private const string SecretSalt = "CuraDoc-HIPAA-Gateway-2026-SecretKey";

    public static string CreateToken(AppUser user)
    {
        var payload = $"{user.Id}|{user.Email}|{user.Role}";
        var sig = ComputeSignature(payload);
        return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{payload}|{sig}"));
    }

    public static (Guid UserId, string Email, UserRole Role)? ValidateToken(string? rawToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken)) return null;
        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(rawToken));
            var parts = decoded.Split('|');
            if (parts.Length != 4) return null;

            var payload = $"{parts[0]}|{parts[1]}|{parts[2]}";
            var expectedSig = ComputeSignature(payload);
            if (!string.Equals(parts[3], expectedSig, StringComparison.Ordinal)) return null;

            return (Guid.Parse(parts[0]), parts[1], Enum.Parse<UserRole>(parts[2]));
        }
        catch
        {
            return null;
        }
    }

    private static string ComputeSignature(string input)
    {
        var bytes = HMACSHA256.HashData(Encoding.UTF8.GetBytes(SecretSalt), Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireSuperAdminAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var authHeader = context.HttpContext.Request.Headers.Authorization.FirstOrDefault();
        var token = authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true
            ? authHeader["Bearer ".Length..].Trim()
            : null;

        var claims = SimpleTokenService.ValidateToken(token);
        if (claims == null)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Authentication required to access Backoffice." });
            return;
        }

        if (claims.Value.Role != UserRole.SuperAdmin)
        {
            context.Result = new ObjectResult(new { message = "Forbidden: Backoffice access is restricted to SuperAdmin users only." })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        context.HttpContext.Items["UserEmail"] = claims.Value.Email;
    }
}
