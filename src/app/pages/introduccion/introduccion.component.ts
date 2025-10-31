import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IntegrantesService, Integrante } from '../../services/integrantes.service';

@Component({
  selector: 'app-introduccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './introduccion.component.html',
  styleUrls: ['./introduccion.component.css']
})
export class IntroduccionComponent implements OnInit, OnDestroy {
  mostrarModalAgregar = false;
  integrantes: Integrante[] = [];
  procesandoImagen = false;
  private subscription: Subscription = new Subscription();
  
  nuevoIntegrante: Omit<Integrante, 'id'> = {
    nombre: '',
    rol: '',
    descripcion: '',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };

  constructor(
    private router: Router,
    private integrantesService: IntegrantesService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de integrantes
    this.subscription.add(
      this.integrantesService.integrantes$.subscribe(integrantes => {
        this.integrantes = integrantes;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  abrirModalAgregarIntegrante() {
    this.mostrarModalAgregar = true;
    this.resetearFormulario();
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.nuevoIntegrante = {
      nombre: '',
      rol: '',
      descripcion: '',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.mostrarMensaje('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarMensaje('La imagen debe ser menor a 5MB');
        return;
      }

      try {
        this.procesandoImagen = true;
        this.mostrarMensaje('Procesando imagen...');
        
        // Comprimir y optimizar la imagen
        const imagenComprimida = await this.integrantesService.comprimirImagen(file);
        this.nuevoIntegrante.foto = imagenComprimida;
        
        this.mostrarMensaje('Imagen cargada y optimizada exitosamente');
      } catch (error) {
        console.error('Error procesando imagen:', error);
        this.mostrarMensaje('Error procesando la imagen. Intenta con otra.');
      } finally {
        this.procesandoImagen = false;
      }
    }
  }

  agregarIntegrante() {
    if (!this.nuevoIntegrante.nombre.trim() || !this.nuevoIntegrante.rol.trim()) {
      this.mostrarMensaje('Por favor completa los campos obligatorios');
      return;
    }

    const integranteParaAgregar = {
      nombre: this.nuevoIntegrante.nombre.trim(),
      rol: this.nuevoIntegrante.rol.trim(),
      descripcion: this.nuevoIntegrante.descripcion.trim(),
      foto: this.nuevoIntegrante.foto
    };

    this.integrantesService.agregarIntegrante(integranteParaAgregar);
    this.cerrarModalAgregar();
    this.mostrarMensaje('Integrante agregado y guardado exitosamente');
  }

  eliminarIntegrante(integrante: Integrante) {
    this.integrantesService.eliminarIntegrante(integrante.id);
    this.mostrarMensaje('Integrante eliminado');
  }

  trackByIntegrante(_index: number, integrante: Integrante): number {
    return integrante.id;
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  private mostrarMensaje(mensaje: string) {
    const alerta = document.createElement('div');
    alerta.className = 'fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-lg z-50 transform transition-all duration-300 translate-y-[-100px] mx-auto max-w-sm';
    alerta.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
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