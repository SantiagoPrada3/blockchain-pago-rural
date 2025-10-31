// src/app/pages/contactos/contactos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService, Contact } from '../../services/contact.service';
import { MetamaskService } from '../../services/metamask.service';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css']
})
export class ContactosComponent implements OnInit {
  busqueda = '';
  filtroActivo = 'todos';
  isConnected = false;
  isLoading = false;

  contactos: Contact[] = [];
  favoritos: Contact[] = [];

  // Modal para agregar contacto
  mostrarModalAgregar = false;
  nuevoContactoAddress = '';
  nuevoContactoNombre = '';

  // Modal para editar contacto
  mostrarModalEditar = false;
  contactoEditando: Contact | null = null;
  nombreEditando = '';

  constructor(
    private router: Router,
    private contactService: ContactService,
    private metamaskService: MetamaskService
  ) {}

  ngOnInit() {
    // Verificar conexión de MetaMask
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.cargarContactos();
      }
    });

    // Suscribirse a cambios en contactos
    this.contactService.contacts$.subscribe(contacts => {
      this.contactos = contacts;
      this.favoritos = contacts.filter(c => c.esFavorito).slice(0, 5);
    });

    this.cargarContactos();
  }

  cargarContactos() {
    this.contactos = this.contactService.getContacts();
    this.favoritos = this.contactService.getFavorites().slice(0, 5);
  }

  get contactosFiltrados(): Contact[] {
    let contactosFiltrados = this.contactos;

    if (this.filtroActivo === 'favoritos') {
      contactosFiltrados = contactosFiltrados.filter(c => c.esFavorito);
    }

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      contactosFiltrados = contactosFiltrados.filter(c =>
        c.nombre.toLowerCase().includes(busquedaLower) ||
        c.address.toLowerCase().includes(busquedaLower) ||
        (c.telefono && c.telefono.includes(this.busqueda))
      );
    }

    // Ordenar por favoritos primero, luego por última transacción
    return contactosFiltrados.sort((a, b) => {
      if (a.esFavorito && !b.esFavorito) return -1;
      if (!a.esFavorito && b.esFavorito) return 1;
      
      const dateA = a.ultimaTransaccion ? new Date(a.ultimaTransaccion).getTime() : 0;
      const dateB = b.ultimaTransaccion ? new Date(b.ultimaTransaccion).getTime() : 0;
      return dateB - dateA;
    });
  }

  get conteoFavoritos(): number {
    return this.contactos.filter(c => c.esFavorito).length;
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  enviarDinero(contacto: Contact) {
    this.router.navigate(['/enviar-dinero'], {
      queryParams: {
        address: contacto.address,
        contacto: contacto.nombre,
        balance: contacto.balance || '0'
      }
    });
  }

  toggleFavorito(contacto: Contact, event: Event) {
    event.stopPropagation();
    this.contactService.toggleFavorite(contacto.address);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const mensaje = contacto.esFavorito 
      ? `${contacto.nombre} eliminado de favoritos`
      : `${contacto.nombre} agregado a favoritos`;
    
    this.mostrarNotificacion(mensaje, 'success');
  }

  abrirModalAgregar() {
    if (!this.isConnected) {
      this.mostrarNotificacion('Conecta tu wallet de MetaMask primero', 'error');
      this.router.navigate(['/login']);
      return;
    }
    
    this.mostrarModalAgregar = true;
    this.nuevoContactoAddress = '';
    this.nuevoContactoNombre = '';
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
    this.nuevoContactoAddress = '';
    this.nuevoContactoNombre = '';
  }

  async agregarContacto() {
    if (!this.nuevoContactoAddress.trim()) {
      this.mostrarNotificacion('Ingresa una dirección válida', 'error');
      return;
    }

    const web3 = this.metamaskService.getWeb3();
    if (!web3 || !web3.utils.isAddress(this.nuevoContactoAddress)) {
      this.mostrarNotificacion('La dirección no es válida', 'error');
      return;
    }

    try {
      this.isLoading = true;
      
      const contacto = this.contactService.addOrUpdateContact(
        this.nuevoContactoAddress,
        this.nuevoContactoNombre.trim() || undefined
      );

      // Actualizar balance del contacto
      await this.contactService.updateContactBalance(
        this.nuevoContactoAddress,
        web3
      );

      this.mostrarNotificacion('Contacto agregado exitosamente', 'success');
      this.cerrarModalAgregar();
    } catch (error) {
      console.error('Error agregando contacto:', error);
      this.mostrarNotificacion('Error al agregar contacto', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  abrirModalEditar(contacto: Contact, event: Event) {
    event.stopPropagation();
    this.contactoEditando = contacto;
    this.nombreEditando = contacto.nombre;
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.contactoEditando = null;
    this.nombreEditando = '';
  }

  guardarEdicion() {
    if (!this.contactoEditando || !this.nombreEditando.trim()) {
      return;
    }

    this.contactService.updateContactName(
      this.contactoEditando.address,
      this.nombreEditando.trim()
    );

    this.mostrarNotificacion('Contacto actualizado', 'success');
    this.cerrarModalEditar();
  }

  eliminarContacto(contacto: Contact, event: Event) {
    event.stopPropagation();
    
    const confirmar = confirm(
      `¿Estás seguro de eliminar a ${contacto.nombre}?`
    );
    
    if (confirmar) {
      this.contactService.deleteContact(contacto.address);
      this.mostrarNotificacion('Contacto eliminado', 'success');
    }
  }

  async importarContactos() {
    if (!this.isConnected) {
      this.mostrarNotificacion('Conecta tu wallet primero', 'error');
      return;
    }

    try {
      this.isLoading = true;
      await this.metamaskService.importContacts();
      this.mostrarNotificacion('Contactos importados del historial', 'success');
    } catch (error) {
      console.error('Error importando contactos:', error);
      this.mostrarNotificacion('Error al importar contactos', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  copiarDireccion(address: string, event: Event) {
    event.stopPropagation();
    
    navigator.clipboard.writeText(address).then(() => {
      this.mostrarNotificacion('Dirección copiada', 'success');
    }).catch(() => {
      this.mostrarNotificacion('Error al copiar', 'error');
    });
  }

  private mostrarNotificacion(
    mensaje: string, 
    tipo: 'success' | 'error' | 'info' = 'info'
  ) {
    const colores = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const alerta = document.createElement('div');
    alerta.className = `fixed top-4 left-4 right-4 ${colores[tipo]} text-white p-4 rounded-2xl shadow-lg z-50 transform transition-all duration-300 translate-y-[-100px] mx-auto max-w-sm`;
    alerta.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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

  trackByAddress(_index: number, contacto: Contact): string {
    return contacto.address;
  }
}