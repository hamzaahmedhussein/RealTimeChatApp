import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  authService = inject(AuthService);
  hubUrl = "http://localhost:5268/chat";
  onlineUsers = signal<User[]>([]);
  currentOpenedChat=signal<User|null>(null);
  hubConnection?: HubConnection;

  startConnection(token: string, senderId?: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}${senderId ? `?senderId=${senderId}` : ''}`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()  // <-- call as a function
      .then(() => {
        console.log('Connection started');
      })
      .catch((error) => {
        console.error('Connection or login error', error);
      });

    this.hubConnection.on('onlineUsers', (users: User[]) => {  // renamed param to "users" for clarity
      console.log(users);
      this.onlineUsers.update(() => 
        users.filter(user => user.userName !== this.authService.currentLoggedUser?.userName)
      );
    });
  }

  disconnectConnection()
  {
    if(this.hubConnection?.state===HubConnectionState.Connected)
    {
      this.hubConnection.stop().catch((error) => console.log(error));
    }
  }
}
