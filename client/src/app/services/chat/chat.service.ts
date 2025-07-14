import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { error } from 'console';
import { Message } from '../../models/message';
import { single } from 'rxjs';

@Injectable({

  providedIn: 'root'
})
export class ChatService {

  authService = inject(AuthService);
  hubUrl = "http://localhost:5268/chat";
  onlineUsers = signal<User[]>([]);
  currentOpenedChat=signal<User|null>(null);
  hubConnection?: HubConnection;
  chatMessage = signal<Message[]>([]);
  isLoading = signal<boolean>(true);
  autoScrollEnbled = signal<boolean>(true);
  startConnection(token: string, senderId?: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}${senderId ? `?senderId=${senderId}` : ''}`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()  
      .then(() => {
        console.log('Connection started');
      })
      .catch((error) => {
        console.error('Connection or login error', error);
      });

  this.hubConnection!.on('Notify', (user: User) => {
  Notification.requestPermission().then((result) => {
    if (result === 'granted') {
      new Notification('Active now', {
        body: user.fullName + ' is online now',
        icon: user.profileImage,
      });
    }
  });
});


    this.hubConnection.on('onlineUsers', (users: User[]) => {  
      console.log(users);
      this.onlineUsers.update(() => 
        users.filter(user => user.userName !== this.authService.currentLoggedUser?.userName)
      );
    });



    this.hubConnection.on('NotyfyTypingToUser',(senderUserName)=>{
      this.onlineUsers.update((users)=>
        users.map((user)=>
        {
           if(user.userName===senderUserName)
           {
            user.isTyping=true;
           }
           return user;
        })  
      )
      setTimeout(() => {
      this.onlineUsers.update((users)=>
        users.map((user)=>
        {
           if(user.userName===senderUserName)
           {
            user.isTyping=false;
           }
           return user;
          })) 
        },2000);

    })


    this.hubConnection!.on("ReceiveMessageList",(message)=>{
      this.isLoading.update((()=>true));
      this.chatMessage.update(messages=>[...message,messages])
      this.isLoading.update(()=>false); 
    });

    this.hubConnection!.on('ReceiveNewMessage',(message:Message)=>{
        document.title='(1) New Message';
        this.chatMessage.update((messages)=>[...messages,message])
    })
  }

  disconnectConnection()
  {
    if(this.hubConnection?.state===HubConnectionState.Connected)
    {
      this.hubConnection.stop().catch((error) => console.log(error));
    }
  }
   sendMessage(message:string)
   {
     this.chatMessage.update((messages)=>
    [
      ...messages,
      {
        content:message,
        senderId:this.authService.currentLoggedUser!.id,
        receiverId:this.currentOpenedChat()?.id!,
        createdDate:new Date().toString(),
        isRead:false,
        id:0
      
      }
    ])
    this.hubConnection?.invoke('SendMessage',{
      receiverId:this.currentOpenedChat()?.id,
      content:message,

    }).then((id)=>{
     console.log("message sent to ",id); 
    }).catch((error)=>{
      console.log(error);
    });
   }
  status(userName:string):string
  {
    const currentChatUser=this.currentOpenedChat();
    if(!currentChatUser)
    {
         return 'offline';
    }

    const onlineUser = this.onlineUsers().find
    ((user)=>user.userName===userName)
    return onlineUser?.isTyping?'Typing...' : this.isUserOnline(); 
  }

  isUserOnline() : string
  {
     let onlineUser=this.onlineUsers().find((user)=>user.userName===this.currentOpenedChat()?.userName);
     return onlineUser?.isOnline? 'online' :  this.currentOpenedChat()!.userName;
  }

  loadMessages(pageNumber:number)
  {
      this.isLoading.update((()=>true));
      console.log(pageNumber);
      this.hubConnection?.invoke('LoadMessages',this.currentOpenedChat()?.id,pageNumber)
      .then()
      .catch()
      .finally(()=>{
        this.isLoading.update(()=>false);
      })
  }

  notifyTyping(){
    this.hubConnection?.invoke('NotifyTyping',this.currentOpenedChat()
    ?.userName).then((x)=>
    {
       console.log('notifying for',x);
    })
  }
}
