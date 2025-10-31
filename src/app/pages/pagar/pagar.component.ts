import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagar.component.html',
  styleUrls: ['./pagar.component.css']
})
export class PagarComponent {
  Math = Math;

  opcionesPago = [
    {
      titulo: 'Enviar dinero',
      descripcion: 'Transfiere dinero a tus contactos',
      icono: 'send',
      color: 'bg-blue-500',
      ruta: '/enviar-dinero'
    },
    {
      titulo: 'Escanear QR',
      descripcion: 'Paga escaneando un código QR',
      icono: 'qr',
      color: 'bg-green-500',
      ruta: '/escanear-qr'
    },
    {
      titulo: 'Pagar servicios',
      descripcion: 'Luz, agua, teléfono y más',
      icono: 'services',
      color: 'bg-orange-500',
      ruta: '/pagar-servicios'
    },
    {
      titulo: 'Recargar celular',
      descripcion: 'Recarga tu saldo móvil',
      icono: 'phone',
      color: 'bg-purple-500',
      ruta: '/recargar-celular'
    },
    {
      titulo: 'Pagar en tienda',
      descripcion: 'Usa tu código QR para pagar',
      icono: 'store',
      color: 'bg-pink-500',
      ruta: '/mi-qr'
    },
    {
      titulo: 'Transferencia bancaria',
      descripcion: 'Envía dinero a cuentas bancarias',
      icono: 'bank',
      color: 'bg-indigo-500',
      ruta: '/transferencia-bancaria'
    }
  ];

  transaccionesRecientes = [
    {
      nombre: 'María González',
      descripcion: 'Almuerzo en restaurante',
      monto: -50.00,
      fecha: 'Hoy, 2:30 PM',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      nombre: 'Carlos Mendoza',
      descripcion: 'Pago por servicios',
      monto: 120.50,
      fecha: 'Ayer, 11:45 AM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  constructor(private router: Router) {}

  navegarA(ruta: string) {
    if (ruta === '/escanear-qr' || ruta === '/pagar-servicios' || ruta === '/recargar-celular' || ruta === '/transferencia-bancaria') {
      // Para rutas no implementadas, mostrar mensaje
      this.mostrarMensaje('Función próximamente disponible');
      return;
    }
    this.router.navigate([ruta]);
  }

  mostrarMensaje(mensaje: string) {
    const alerta = document.createElement('div');
    alerta.className = 'fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-y-[-100px]';
    alerta.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
        document.body.removeChild(alerta);
      }, 300);
    }, 2000);
  }
}