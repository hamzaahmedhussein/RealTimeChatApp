import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,MatIconModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 email!: string ;
  password!: string;
 hide=signal(false);
  
private authService = inject(AuthService);
private router = inject(Router);
private snackBar= inject(MatSnackBar);


login(){
  this.authService.login(this.email,this.password).subscribe({
    next:()=>{
      this.authService.me().subscribe();
            this.snackBar.open('Logged in successully','Close');
    },
    error: (err:HttpErrorResponse)=>{
        let error=err.error as ApiResponse<string>;
        this.snackBar.open(error.error,'Close',{duration:3000})
    },
    complete:()=>{
        this.router.navigate(['/']);
    }
  })
}

 togglePassword(event:MouseEvent)
  {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  
}
