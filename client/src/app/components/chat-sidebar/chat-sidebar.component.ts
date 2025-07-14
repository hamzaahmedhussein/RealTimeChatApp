import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { User } from '../../models/user';
import { TypingIndicatorComponent } from "../typing-indicator/typing-indicator.component";

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule,TypingIndicatorComponent,MatMenuModule, TitleCasePipe, TypingIndicatorComponent],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent { 

  authService=inject(AuthService);
  router=inject(Router);
  chatService=inject(ChatService);
  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

ngOnInit(): void {
  this.chatService.startConnection(this.authService.getAccessToken()!);
}

openChatWindow(user:User)
{
  this.chatService.currentOpenedChat.set(user);
  this.chatService.loadMessages(1);
}

}
