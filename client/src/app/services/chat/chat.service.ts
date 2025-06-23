import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  authService = inject(AuthService);
  hubUrl = "http://localhost:5268/chat";
  onlineUsers = signal<User[]>([]);
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
}
