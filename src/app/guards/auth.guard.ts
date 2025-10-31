import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MetamaskService } from '../services/metamask.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private metamaskService: MetamaskService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.metamaskService.connected$.pipe(
      map(connected => {
        if (!connected) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}