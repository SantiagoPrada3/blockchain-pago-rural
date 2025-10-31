import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Integrante {
  id: number;
  nombre: string;
  rol: string;
  descripcion: string;
  foto: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntegrantesService {
  private readonly STORAGE_KEY = 'cryptopay_integrantes';
  private integrantesSubject = new BehaviorSubject<Integrante[]>([]);
  
  public integrantes$ = this.integrantesSubject.asObservable();

  constructor() {
    this.cargarIntegrantes();
  }

  private cargarIntegrantes(): void {
    try {
      const integrantesGuardados = localStorage.getItem(this.STORAGE_KEY);
      if (integrantesGuardados) {
        const integrantes = JSON.parse(integrantesGuardados);
        this.integrantesSubject.next(integrantes);
      } else {
        // Integrantes por defecto si no hay datos guardados
        const integrantesPorDefecto: Integrante[] = [
          {
            id: 1,
            nombre: 'Ana García',
            rol: 'Product Manager',
            descripcion: 'Especialista en experiencia de usuario y estrategia de producto',
            foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          {
            id: 2,
            nombre: 'Carlos Mendoza',
            rol: 'Blockchain Developer',
            descripcion: 'Experto en desarrollo de smart contracts y tecnología Web3',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        ];
        this.guardarIntegrantes(integrantesPorDefecto);
      }
    } catch (error) {
      console.error('Error cargando integrantes:', error);
      this.integrantesSubject.next([]);
    }
  }

  private guardarIntegrantes(integrantes: Integrante[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(integrantes));
      this.integrantesSubject.next(integrantes);
    } catch (error) {
      console.error('Error guardando integrantes:', error);
    }
  }

  getIntegrantes(): Integrante[] {
    return this.integrantesSubject.value;
  }

  agregarIntegrante(integrante: Omit<Integrante, 'id'>): void {
    const integrantes = this.getIntegrantes();
    const nuevoId = Math.max(...integrantes.map(i => i.id), 0) + 1;
    
    const nuevoIntegrante: Integrante = {
      ...integrante,
      id: nuevoId
    };

    const nuevosIntegrantes = [...integrantes, nuevoIntegrante];
    this.guardarIntegrantes(nuevosIntegrantes);
  }

  eliminarIntegrante(id: number): void {
    const integrantes = this.getIntegrantes();
    const nuevosIntegrantes = integrantes.filter(i => i.id !== id);
    this.guardarIntegrantes(nuevosIntegrantes);
  }

  actualizarIntegrante(integranteActualizado: Integrante): void {
    const integrantes = this.getIntegrantes();
    const index = integrantes.findIndex(i => i.id === integranteActualizado.id);
    
    if (index > -1) {
      const nuevosIntegrantes = [...integrantes];
      nuevosIntegrantes[index] = integranteActualizado;
      this.guardarIntegrantes(nuevosIntegrantes);
    }
  }

  // Método para comprimir y optimizar imágenes
  comprimirImagen(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Configurar el tamaño del canvas (máximo 300x300 para optimizar almacenamiento)
        const maxSize = 300;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con calidad optimizada
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      };

      img.onerror = () => reject(new Error('Error cargando la imagen'));

      // Crear URL de la imagen desde el archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsDataURL(file);
    });
  }

  // Método para limpiar el almacenamiento (útil para desarrollo/testing)
  limpiarDatos(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.integrantesSubject.next([]);
  }
}