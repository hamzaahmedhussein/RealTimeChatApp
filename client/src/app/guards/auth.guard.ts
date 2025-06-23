import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Router } from 'express';

export const authGuard: CanActivateFn = (route, state) => {
  if(inject(AuthService).isLoggedIn())
      return true;
  
  inject(Router).navigate(["/login"])
  return false;
};
