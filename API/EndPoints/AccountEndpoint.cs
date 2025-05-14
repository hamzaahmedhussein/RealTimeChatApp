using System.Text.RegularExpressions;
using API.Common;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.EndPoints;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoint(this WebApplication app)
    {
        var Group = app.MapGroup("/api/account").WithTags("account");

        Group.MapPost("/register", async (
            HttpContext context, 
            UserManager<AppUser> userManager, 
            [FromForm] string fullName, 
            [FromForm] string userName, 
            [FromForm] IFormFile profilePicture, 
            [FromForm] string email, 
            [FromForm] string password) =>
        {
            // Check if the email already exists in the database
            var userFromDb = await userManager.FindByEmailAsync(email);
            if (userFromDb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("Email address already exists"));
            }

            // Removed the incorrect check for profile picture
            var picture = await FileUpload.UploadFile(profilePicture);

            // Generate the absolute URL for the uploaded profile picture
            picture = $"{context.Request.Scheme}://{context.Request.Host}{context.Request.PathBase}/upload/{picture}";

            var user = new AppUser
            {
                Email = email,
                FullName = fullName,
                UserName = userName,
                ProfileImage = picture
            };

            var result = await userManager.CreateAsync(user, password);

            // Handle creation result
            if (!result.Succeeded)
            {
                var errorMessage = result.Errors.Select(x => x.Description).FirstOrDefault() ?? "Registration failed.";
                return Results.BadRequest(Response<string>.Failure(errorMessage));
            }

            return Results.Ok(Response<string>.Success("", "User created successfully"));
        }).DisableAntiforgery();

        
        Group.MapPost("/login",async (UserManager<AppUser> userManager,TokenService tokenServce,LoginDto dto) =>
        {
            if(dto is null)
                return Results.BadRequest(Response<string>.Failure("Invalid login data"));
            
            var user =  await userManager.FindByEmailAsync(dto.Email);
            
            if (user is null)
                return Results.BadRequest(Response<string>.Failure("Invalid user not found"));
            
            var reslut =await userManager.CheckPasswordAsync(user,dto.Password);
            
            if(!reslut)
                return Results.BadRequest(Response<string>.Failure("Invalid password"));

            var token = tokenServce.GenerateToken(user.Id,user.UserName);
            return Results.Ok(Response<string>.Success(token,"Login successfully"));
        });

        Group.MapGet("/me", async (UserManager<AppUser> userManager, HttpContext context) =>
        {
            var CurrentUserId = context.User.GetUserId();
            var CurrentUser = await userManager.Users.SingleOrDefaultAsync(x => x.Id == CurrentUserId.ToString());
            return Results.Ok(Response<AppUser>.Success(CurrentUser,"User fetched successfully"));
        }).RequireAuthorization();
        
        return Group;
    }
}
    