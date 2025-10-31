import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {
  usuario: UserProfile = {
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    avatar: '',
    perfilPublico: true,
    mostrarTelefono: false
  };

  originalUsuario: UserProfile = { ...this.usuario };
  isLoading = false;
  hasChanges = false;

  generos = [
    { value: '', label: 'Seleccionar' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' }
  ];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Cargar datos del usuario actual
    this.userService.user$.subscribe(user => {
      this.usuario = { ...user };
      this.originalUsuario = { ...user };
    });
  }

  onInputChange() {
    // Verificar si hay cambios
    this.hasChanges = JSON.stringify(this.usuario) !== JSON.stringify(this.originalUsuario);
  }

  async guardarCambios() {
    if (!this.hasChanges) {
      this.mostrarMensaje('No hay cambios para guardar', 'info');
      return;
    }

    // Validar campos requeridos
    if (!this.usuario.nombre.trim()) {
      this.mostrarMensaje('El nombre es requerido', 'error');
      return;
    }

    if (!this.usuario.email.trim()) {
      this.mostrarMensaje('El email es requerido', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.usuario.email)) {
      this.mostrarMensaje('El formato del email no es válido', 'error');
      return;
    }

    this.isLoading = true;

    try {
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar usuario
      this.userService.updateUser(this.usuario);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      this.mostrarMensaje('Perfil actualizado exitosamente', 'success');

      // Volver al perfil después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/perfil']);
      }, 1500);

    } catch (error) {
      this.mostrarMensaje('Error al guardar los cambios', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  cambiarFoto() {
    // Generar avatar aleatorio
    const nuevoAvatar = this.userService.generateRandomAvatar();
    this.usuario.avatar = nuevoAvatar;
    this.onInputChange();

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    this.mostrarMensaje('Foto actualizada', 'success');
  }

  subirFoto() {
    // Crear input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Crear URL temporal para la imagen
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.usuario.avatar = e.target.result;
          this.onInputChange();
          this.mostrarMensaje('Foto cargada exitosamente', 'success');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  volver() {
    if (this.hasChanges) {
      const confirmar = confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
      if (!confirmar) return;
    }
    this.router.navigate(['/perfil']);
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info') {
    const colores = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const iconos = {
      success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      error: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      info: 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
    };

    const alerta = document.createElement('div');
    alerta.className = `fixed top-4 left-4 right-4 ${colores[tipo]} text-white p-4 rounded-2xl shadow-lg z-50 transform transition-all duration-300 translate-y-[-100px] mx-auto max-w-sm`;
    alerta.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="${iconos[tipo]}"/>
        </svg>
        <p class="font-medium">${mensaje}</p>
      </div>
    `;

    document.body.appendChild(alerta);

    setTimeout(() => {
      alerta.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
      alerta.style.transform = 'translateY(-100px)';
      setTimeout(() => {
        if (document.body.contains(alerta)) {
          document.body.removeChild(alerta);
        }
      }, 300);
    }, 3000);
  }
}