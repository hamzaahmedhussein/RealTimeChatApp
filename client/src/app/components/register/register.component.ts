import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatFormFieldModule} from "@angular/material/form-field"
import {MatInputModule} from "@angular/material/input"
import {MatButtonModule} from "@angular/material/button"
import {MatIconModule} from "@angular/material/icon"
import {MatSnackBar} from "@angular/material/snack-bar"
import { AuthService } from '../../services/auth/auth.service';
import { ApiResponse } from '../../models/api-response';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,MatIconModule]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  fullName: string = '';
  profilePicture: string = 'https://randomuser.me/api/portraits/lego/5.jpg';
  profileImage: File | null = null;
  hide=signal(false);
  snackBar = inject(MatSnackBar);
  authService=inject(AuthService);
  router=inject(Router);
 register()
 {
  let formData=new FormData();
  formData.append("email",this.email);
  formData.append("fullName",this.fullName);
  formData.append("password", this.password);
  formData.append("profileImage",this.profileImage!);

  this.authService.register(formData).subscribe({
    next:()=>{
              this.snackBar.open("User registered successfully","Close")
    },
    error:(error:HttpErrorResponse)=>{
              let err =error.error as ApiResponse<string>;
              this.snackBar.open(err.error,"Close")
    },
    complete:()=>{
      this.router.navigate(['/']);
    }
  })

        
 }

  togglePassword(event:MouseEvent)
  {
    this.hide.set(!this.hide());
  }
  

  onFileSelected(event:any)
  {
    const file : File=event.target.files[0];
    if(file){ this.profileImage=file;
    const reader = new FileReader();
    reader.onload=(e)=>{
      this.profilePicture= e.target!.result as string;
      console.log(e.target?.result);
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);}
   
  }
}