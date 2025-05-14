using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService
{
    private readonly IConfiguration _config;
    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(string userId, string userName)
    {
        var TokenHandler = new JwtSecurityTokenHandler();
        var Key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
        var Clims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, userName)
        };
        var TokenDescriptor = new SecurityTokenDescriptor
        { 
            Subject = new ClaimsIdentity(Clims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Key), SecurityAlgorithms.HmacSha256)
        };
        var token = TokenHandler.CreateToken(TokenDescriptor);
        return TokenHandler.WriteToken(token);
    }
}