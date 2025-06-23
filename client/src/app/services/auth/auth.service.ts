import { Injectable, inject } from '@angular/core';
import { Observable, retry, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response';
import { response } from 'express';
import { User } from '../../models/user';
import { json } from 'stream/consumers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = "http://localhost:5268/account";
  private readonly httpClient = inject(HttpClient);
  private token = 'token';

  register(data: FormData): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      `${this.baseUrl}/register`, 
      data
    ).pipe(
      tap((response: ApiResponse<string>) => {
        if (response?.data) {
          localStorage.setItem("token", response.data);
        }
      })
    );
  }


  login(email:string,password:string):Observable<ApiResponse<string>>
  {
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/login`,{email,password})
  .pipe(
    tap(
      (response)=>{
        {
            localStorage.setItem(this.token,response.data);
        }
        return response;
      }
    )
  );
  }


  me():Observable<ApiResponse<User>>
  {
    return this.httpClient.get<ApiResponse<User>>(`${this.baseUrl}/me`,{
      headers:{
        Authorization : `Bearer ${this.getAccessToken()}`,
      },
    })
    .pipe(
      tap(
        (response)=>{
          if(response.isSuccessful)
            localStorage.setItem("user",JSON.stringify(response.data));
        }
      )
    )
  }

  getAccessToken() : string|null
  {
     return localStorage.getItem(this.token);
  }


  isLoggedIn():boolean
  {
    return !!localStorage.getItem(this.token);
  }
  
  logout()
  {
    localStorage.removeItem(this.token)
    localStorage.removeItem('user');

  }

  get currentLoggedUser () : User | null
  {
    const user: User =JSON.parse(localStorage.getItem('user') || '{}')
    return user;
  }
}