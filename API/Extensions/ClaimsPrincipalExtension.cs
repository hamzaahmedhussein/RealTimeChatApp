using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipalExtension
{
    public static string GetUserName(this ClaimsPrincipal user)
    {
          return user.FindFirstValue(ClaimTypes.Name)?? throw new Exception("Can't find user name");
    }

    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        return Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)?? throw new Exception("Can't find user id"));
    }
}