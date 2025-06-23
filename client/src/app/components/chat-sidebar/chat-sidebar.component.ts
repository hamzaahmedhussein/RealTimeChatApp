import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule,TitleCasePipe],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent { 

  authService=inject(AuthService);
  router=inject(Router);
  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
