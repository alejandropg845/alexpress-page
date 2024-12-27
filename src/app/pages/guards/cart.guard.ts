import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';

export const cartGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userCartObservable
  .pipe(map(data => 
    (!data || data.length === 0) ? router.parseUrl('/alexpress/home') : true
  ));

};
