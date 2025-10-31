import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/introduccion', pathMatch: 'full' },
  { path: 'introduccion', loadComponent: () => import('./pages/introduccion/introduccion.component').then(m => m.IntroduccionComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent), canActivate: [AuthGuard] },
  { path: 'pagar', loadComponent: () => import('./pages/pagar/pagar.component').then(m => m.PagarComponent), canActivate: [AuthGuard] },
  { path: 'contactos', loadComponent: () => import('./pages/contactos/contactos.component').then(m => m.ContactosComponent), canActivate: [AuthGuard] },
  { path: 'historial', loadComponent: () => import('./pages/historial/historial.component').then(m => m.HistorialComponent), canActivate: [AuthGuard] },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent), canActivate: [AuthGuard] },
  { path: 'editar-perfil', loadComponent: () => import('./pages/editar-perfil/editar-perfil.component').then(m => m.EditarPerfilComponent), canActivate: [AuthGuard] },
  { path: 'enviar-dinero', loadComponent: () => import('./pages/enviar-dinero/enviar-dinero.component').then(m => m.EnviarDineroComponent), canActivate: [AuthGuard] },
  { path: 'mi-qr', loadComponent: () => import('./pages/mi-qr/mi-qr.component').then(m => m.MiQrComponent), canActivate: [AuthGuard] }
];
