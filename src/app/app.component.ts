import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pib-web-paymentrural';
  showNavigation = true;

  constructor(private router: Router) {
    // Escuchar cambios de ruta para mostrar/ocultar navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Ocultar navegación en las páginas de introducción y login
        this.showNavigation = !event.url.includes('/login') && !event.url.includes('/introduccion');
      });
  }
}
