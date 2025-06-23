import { Component } from '@angular/core';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ChatWindowComponent } from "../chat-window/chat-window.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatSidebarComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

}
