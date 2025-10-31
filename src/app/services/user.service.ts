import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  avatar: string;
  perfilPublico: boolean;
  mostrarTelefono: boolean;
  saldo?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<UserProfile>({
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '+51 999 888 777',
    fechaNacimiento: '1990-05-15',
    genero: 'masculino',
    direccion: 'Lima, Perú',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    perfilPublico: true,
    mostrarTelefono: false
  });

  public user$ = this.userSubject.asObservable();

  constructor() {
    // Cargar datos del localStorage si existen
    this.loadUserData();
  }

  private loadUserData() {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.userSubject.next(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }

  updateUser(userData: Partial<UserProfile>) {
    const currentUser = this.userSubject.value;
    const updatedUser = { ...currentUser, ...userData };

    this.userSubject.next(updatedUser);

    // Guardar en localStorage
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));

    console.log('👤 Usuario actualizado:', updatedUser);
  }

  getCurrentUser(): UserProfile {
    return this.userSubject.value;
  }

  updateAvatar(avatarUrl: string) {
    this.updateUser({ avatar: avatarUrl });
  }

  // Método para generar avatar aleatorio
  generateRandomAvatar(): string {
    const avatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    ];

    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}