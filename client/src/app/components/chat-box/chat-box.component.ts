import { Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner'
import { AuthService } from '../../services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports:[MatProgressSpinner,DatePipe,MatIconModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent {
@ViewChild('chatBox', { read: ElementRef }) public chatBox?: ElementRef;
chatService= inject(ChatService);
authService=inject(AuthService);
private pageNumber=2;

loadMoreMessages()
{
  this.pageNumber++;
  this.chatService.loadMessages(this.pageNumber);
  this.scrollTop()
}

afterViewChecked():void
{
  if(this.chatService.autoScrollEnbled())
  {
   this.scrollBottom();
  }
}

scrollBottom()
{
  this.chatService.autoScrollEnbled.set(true);
  this.chatBox?.nativeElement.scrollTo({
    top:this.chatBox.nativeElement.scrollHeight,
    behavior:'smooth'
    })
}

scrollTop()
{
  this.chatService.autoScrollEnbled.set(false);
  this.chatBox?.nativeElement.scrollTo({
    top:this.chatBox.nativeElement.scrollHeight,
    behavior:'smooth'
    })
}
}
