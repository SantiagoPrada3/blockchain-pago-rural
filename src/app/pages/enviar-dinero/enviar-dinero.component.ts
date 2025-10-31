// src/app/pages/enviar-dinero/enviar-dinero.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MetamaskService } from '../../services/metamask.service';
import { ContactService, Contact } from '../../services/contact.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-enviar-dinero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-dinero.component.html',
  styleUrls: ['./enviar-dinero.component.css']
})
export class EnviarDineroComponent implements OnInit {
  monto = '';
  descripcion = '';
  contactoSeleccionado: Contact | null = null;
  isConnected = false;
  userBalance = '0';
  isSending = false;

  contactosRecientes: Contact[] = [];

  // Para buscar dirección manualmente
  direccionManual = '';
  usandoDireccionManual = false;

  // Exponer parseFloat para el template
  parseFloat = parseFloat;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private metamaskService: MetamaskService,
    private contactService: ContactService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    // Verificar conexión
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
      if (!connected) {
        this.mostrarAlerta('Conecta tu wallet para enviar dinero', 'error');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });

    // Obtener balance
    this.metamaskService.balance$.subscribe(balance => {
      this.userBalance = balance;
    });

    // Obtener contactos recientes (máximo 3)
    this.contactService.contacts$.subscribe(contacts => {
      this.contactosRecientes = contacts
        .filter(c => c.ultimaTransaccion)
        .sort((a, b) => {
          const dateA = a.ultimaTransaccion ? new Date(a.ultimaTransaccion).getTime() : 0;
          const dateB = b.ultimaTransaccion ? new Date(b.ultimaTransaccion).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
    });

    // Verificar si se pasó información de contacto desde otra página
    this.route.queryParams.subscribe(params => {
      if (params['address']) {
        // Buscar contacto por dirección
        const contacts = this.contactService.getContacts();
        const contact = contacts.find(c => 
          c.address.toLowerCase() === params['address'].toLowerCase()
        );

        if (contact) {
          this.contactoSeleccionado = contact;
        } else {
          // Crear contacto temporal
          this.contactoSeleccionado = {
            address: params['address'],
            nombre: params['contacto'] || this.getShortAddress(params['address']),
            avatar: this.generateAvatarUrl(params['address']),
            esFavorito: false,
            transaccionesRealizadas: 0,
            balance: params['balance']
          };
        }
      }
    });
  }

  agregarNumero(numero: string) {
    if (numero === '.' && this.monto.includes('.')) return;
    
    // Evitar múltiples ceros al inicio
    if (this.monto === '0' && numero === '0') return;
    if (this.monto === '0' && numero !== '.') {
      this.monto = numero;
      return;
    }
    
    // Limitar decimales a 6 dígitos
    if (this.monto.includes('.')) {
      const decimales = this.monto.split('.')[1];
      if (decimales && decimales.length >= 6) return;
    }
    
    if (this.monto.length < 12) {
      this.monto += numero;
    }
  }

  borrarUltimo() {
    this.monto = this.monto.slice(0, -1);
  }

  get montoNumerico(): number {
    return parseFloat(this.monto) || 0;
  }

  // Obtener monto limpio para transacciones
  get montoLimpio(): string {
    const numero = this.montoNumerico;
    if (numero <= 0) return '0';
    
    // Asegurar que no tenga más de 18 decimales (límite de ETH)
    return numero.toFixed(Math.min(18, (this.monto.split('.')[1] || '').length));
  }

  get puedeEnviar(): boolean {
    const tieneContacto = !!(this.contactoSeleccionado || 
                            (this.usandoDireccionManual && this.direccionManual));
    const tieneMonto = this.montoNumerico > 0;
    const balanceSuficiente = this.montoNumerico <= parseFloat(this.userBalance);
    
    return tieneContacto && tieneMonto && balanceSuficiente && !this.isSending;
  }

  get mensajeBoton(): string {
    if (this.isSending) {
      return 'Enviando...';
    }
    if (!this.isConnected) {
      return 'Conecta tu wallet';
    }
    if (this.montoNumerico === 0) {
      return 'Ingresa un monto';
    }
    if (!this.contactoSeleccionado && !this.usandoDireccionManual) {
      return 'Selecciona un contacto';
    }
    if (this.montoNumerico > parseFloat(this.userBalance)) {
      return 'Balance insuficiente';
    }
    return `Enviar ${this.montoNumerico.toFixed(4)} ETH`;
  }

  seleccionarContacto(contacto: Contact) {
    this.contactoSeleccionado = contacto;
    this.usandoDireccionManual = false;
    this.direccionManual = '';
  }

  deseleccionarContacto() {
    this.contactoSeleccionado = null;
  }

  activarDireccionManual() {
    this.usandoDireccionManual = true;
    this.contactoSeleccionado = null;
  }

  cancelarDireccionManual() {
    this.usandoDireccionManual = false;
    this.direccionManual = '';
  }

  async enviarDinero() {
    await this.enviarTransaccion(false);
  }

  async enviarTransaccionForzada() {
    await this.enviarTransaccion(true);
  }

  private async enviarTransaccion(forzada: boolean = false) {
    if (!this.puedeEnviar && !forzada) return;

    const destinatario = this.contactoSeleccionado?.address || this.direccionManual;
    
    if (!destinatario) {
      this.mostrarAlerta('Selecciona un contacto o ingresa una dirección', 'error');
      return;
    }

    // Validar dirección (más flexible para transacción forzada)
    if (!forzada) {
      const web3 = this.metamaskService.getWeb3();
      if (!web3 || !web3.utils.isAddress(destinatario)) {
        this.mostrarAlerta('La dirección no es válida', 'error');
        return;
      }
    }

    // Confirmar transacción
    const nombreDestinatario = this.contactoSeleccionado?.nombre || 
                               this.getShortAddress(destinatario);
    
    const tipoTransaccion = forzada ? 'FORZAR' : 'enviar';
    const confirmar = confirm(
      `¿Confirmas ${tipoTransaccion} ${this.montoNumerico.toFixed(4)} ETH a ${nombreDestinatario}?${forzada ? '\n\n⚠️ TRANSACCIÓN FORZADA - Omite validaciones' : ''}`
    );

    if (!confirmar) return;

    this.isSending = true;

    try {
      // Validar y limpiar el monto antes de enviar
      console.log('💰 Datos de transacción:');
      console.log('📍 Monto original:', this.monto);
      console.log('🔢 Monto numérico:', this.montoNumerico);
      console.log('✨ Monto limpio:', this.montoLimpio);
      console.log('🎯 Destinatario:', destinatario);
      console.log('⚡ Forzada:', forzada);
      
      // Elegir método según el tipo
      const resultado = forzada 
        ? await this.metamaskService.sendTransactionForced(destinatario, this.montoLimpio)
        : await this.metamaskService.sendTransaction(destinatario, this.montoLimpio);

      if (resultado.success) {
        // Transacción exitosa
        this.mostrarAlertaExito(nombreDestinatario, resultado.hash!);
        
        // Limpiar formulario
        this.monto = '';
        this.descripcion = '';
        this.direccionManual = '';
        this.usandoDireccionManual = false;
        
      } else {
        // Error en la transacción
        this.mostrarAlerta(resultado.error || 'Error al enviar transacción', 'error');
      }
    } catch (error: any) {
      console.error('Error enviando dinero:', error);
      this.mostrarAlerta('Error inesperado al enviar transacción', 'error');
    } finally {
      this.isSending = false;
    }
  }

  mostrarAlertaExito(nombreDestinatario: string, txHash: string) {
    const alerta = document.createElement('div');
    alerta.className = 'fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-2xl shadow-lg z-50 transform transition-transform duration-300 translate-y-[-100px] mx-auto max-w-sm';
    alerta.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <p class="font-semibold">¡Pago enviado exitosamente!</p>
            <p class="text-sm text-green-100">${this.montoNumerico.toFixed(4)} ETH enviado a ${nombreDestinatario}</p>
          </div>
        </div>
        <div class="bg-green-600 rounded-lg p-2">
          <p class="text-xs font-mono truncate">TX: ${txHash}</p>
        </div>
      </div>
    `;

    document.body.appendChild(alerta);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    setTimeout(() => {
      alerta.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
      alerta.style.transform = 'translateY(-100px)';
      setTimeout(() => {
        if (document.body.contains(alerta)) {
          document.body.removeChild(alerta);
        }
        this.router.navigate(['/inicio']);
      }, 300);
    }, 4000);
  }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info') {
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

  verTodosContactos() {
    this.router.navigate(['/contactos']);
  }

  volver() {
    this.router.navigate(['/inicio']);
  }

  private getShortAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  private generateAvatarUrl(address: string): string {
    const seed = address.toLowerCase();
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }
}