import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chat-right-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './chat-right-sidebar.component.html',
  styleUrl: './chat-right-sidebar.component.css'
})
export class ChatRightSidebarComponent {
chatService=inject(ChatService);
}
