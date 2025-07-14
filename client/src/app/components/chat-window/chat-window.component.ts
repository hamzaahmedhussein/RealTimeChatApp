import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { threadId } from 'node:worker_threads';
@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [TitleCasePipe,MatIconModule,FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  @ViewChild('chatBox')  chatContainer?: ElementRef;

chatService=inject(ChatService);
message:string='';


sendMessage()
{
  if(!this.message) return;
  this.chatService.sendMessage(this.message);
  this.message='';
  this.scrollToBottom();
}
private scrollToBottom()
{
  if(this.chatContainer)
  {
    this.chatContainer.nativeElement.scrollTop=this.chatContainer.nativeElement.scrollHeight;
  }
}
}
