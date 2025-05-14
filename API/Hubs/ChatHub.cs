using System.Collections.Concurrent;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Hubs;
[Authorize]
public class ChatHub(UserManager<AppUser> userManager,ApplicationDbContext context):Hub
{
    public static readonly ConcurrentDictionary<string,OnlineUserDto> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var HttpContext = Context.GetHttpContext();
        var ReceiverId = HttpContext?.Request.Query["SenderId"].ToString();
        var UserName = Context.User!.Identity!.Name;
        var CurrentUser = await userManager.FindByNameAsync(UserName);
        var ConnectionId = Context.ConnectionId;
        
        if(OnlineUsers.ContainsKey(UserName))
        {
            OnlineUsers[UserName].ConnectionId = ConnectionId;
        }
        else
        {
            var User = new OnlineUserDto
            {
                ConnectionId = ConnectionId,
                UserName = UserName,
                ProfileImage = CurrentUser!.ProfileImage,
                FullName = CurrentUser.FullName
            };
            OnlineUsers.TryAdd(UserName, User);
            await Clients.AllExcept(ConnectionId).SendAsync("Notify",CurrentUser);
        }

        if (string.IsNullOrEmpty(ReceiverId))
        {
            await LoadMessages(ReceiverId);
        }
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
      

    }

    public async Task SendMessage(MessageRequestDto message)
    {
        var SenderId = Context.User!.Identity!.Name;
        var ReceiverId = message.ReceiverId;

        var newMessage = new Message
        {
            Sender = await userManager.FindByNameAsync(SenderId),
            Resceiver = await userManager.FindByIdAsync(ReceiverId),
            IsRead = false,
            CreateDate = DateTime.Now,
            Content = message.Content
        };
        context.Messages.Add(newMessage);
        await context.SaveChangesAsync();
        await Clients.User(SenderId).SendAsync("ReceiveMessage", newMessage);

    }

    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var UserName = Context.User!.GetUserName();
        var OlineUsersSet = new HashSet<string>(OnlineUsers.Keys);

        var Users = await userManager.Users.Select(u => new OnlineUserDto
        {
            Id = u.Id,
            UserName = u.UserName,
            FullName = u.FullName,
            ProfileImage = u.ProfileImage,
            IsOnline = OlineUsersSet.Contains(u.UserName),
           // UnReadCount = context.Messages.Count(x => x.ReceiverId == UserName && x.SenderId == u.Id && !x.IsRead)


        }).OrderByDescending(u => u.IsOnline).ToListAsync();

        return Users;

    }

    public async Task LoadMessages(string receiverId, int pageNumber = 1)
    {
        int PageSize = 10;
        var UserName = Context.User!.Identity!.Name;
        var CurrentUser = await userManager.FindByNameAsync(UserName!);
        if(CurrentUser == null)
            return;
        List<MessageResponseDto> messages = await context.Messages.Where(x =>
                x.ReceiverId == CurrentUser.Id && x.SenderId == receiverId
                || x.ReceiverId == receiverId && x.SenderId == CurrentUser.Id).OrderByDescending(x => x.CreateDate)
            .Skip((pageNumber - 1) * PageSize)
            .Take(PageSize)
            .OrderBy(x => x.CreateDate)
            .Select(x => new MessageResponseDto
            {
                Id = x.Id,
                Content = x.Content,
                CreateDate = x.CreateDate,
                ReceiverId = x.ReceiverId,
                SenderId = x.SenderId,
            }).ToListAsync();


        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(x => x.Id == message.Id);
            if (msg != null && msg.ReceiverId != CurrentUser.Id)
            {
                msg.IsRead = true;
                await context.SaveChangesAsync();
            }
        }
        await Clients.User(CurrentUser.Id).SendAsync("ReceiveMessagesList", messages);
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userName = Context.User!.Identity!.Name;
        OnlineUsers.TryRemove(userName!, out _);
        await Clients.All.SendAsync("OnlineUsers",await GetAllUsers());

    }

    public async Task NotifyTyping(string receiverUserName)
    {
        var SenderUserName =  Context.User!.Identity!.Name;
        if (SenderUserName is null)
        {
            return;
        }
        var connictionId = OnlineUsers.Values.FirstOrDefault(x => x.UserName == receiverUserName).ConnectionId;
        if (connictionId is not null)
        {
            await Clients.Client(connictionId).SendAsync("NotifyTypingToUser", SenderUserName);
        }
    }
}