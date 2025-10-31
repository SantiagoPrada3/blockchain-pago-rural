import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MetamaskService } from '../../services/metamask.service';
import { UserService, UserProfile } from '../../services/user.service';

interface RedBlockchain {
  chainId: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl?: string;
  color: string;
  esPersonalizada?: boolean;
}

// Declaración de tipos para MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  Math = Math;
  saldoVisible = true;
  mostrarNotificaciones = false;

  // MetaMask data
  isConnected = false;
  account = '';
  balance = '0';
  ethPriceUSD = 2500; // Precio aproximado de ETH en USD
  balanceUSD = 0;

  // Gestión de Redes
  mostrarModalRedes = false;
  mostrarFormularioRed = false;
  redActual: RedBlockchain | null = null;
  
  redesDisponibles: RedBlockchain[] = [
    // Redes principales
    {
      chainId: '0x1',
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/',
      blockExplorerUrl: 'https://etherscan.io',
      color: '#627EEA'
    },
    {
      chainId: '0x89',
      name: 'Polygon Mainnet',
      symbol: 'MATIC',
      rpcUrl: 'https://polygon-rpc.com/',
      blockExplorerUrl: 'https://polygonscan.com',
      color: '#8247E5'
    },
    {
      chainId: '0x38',
      name: 'BSC Mainnet',
      symbol: 'BNB',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      blockExplorerUrl: 'https://bscscan.com',
      color: '#F3BA2F'
    },
    {
      chainId: '0xa4b1',
      name: 'Arbitrum One',
      symbol: 'ETH',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      blockExplorerUrl: 'https://arbiscan.io',
      color: '#28A0F0'
    },
    {
      chainId: '0xa',
      name: 'Optimism',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.optimism.io',
      blockExplorerUrl: 'https://optimistic.etherscan.io',
      color: '#FF0420'
    },
    {
      chainId: '0x2105',
      name: 'Base Mainnet',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.base.org',
      blockExplorerUrl: 'https://basescan.org',
      color: '#0052FF'
    },
    {
      chainId: '0xe708',
      name: 'Linea',
      symbol: 'ETH',
      rpcUrl: 'https://rpc.linea.build',
      blockExplorerUrl: 'https://lineascan.build',
      color: '#00D4FF'
    },
    {
      chainId: '0x144',
      name: 'zkSync Era',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.era.zksync.io',
      blockExplorerUrl: 'https://explorer.zksync.io',
      color: '#8C8DFC'
    },
    // Redes de prueba (Testnets)
    {
      chainId: '0xaa36a7',
      name: 'Sepolia',
      symbol: 'SepoliaETH',
      rpcUrl: 'https://sepolia.infura.io/v3/',
      blockExplorerUrl: 'https://sepolia.etherscan.io',
      color: '#9B59B6'
    },
    {
      chainId: '0x59140',
      name: 'Linea Sepolia',
      symbol: 'ETH',
      rpcUrl: 'https://rpc.sepolia.linea.build',
      blockExplorerUrl: 'https://sepolia.lineascan.build',
      color: '#00D4FF'
    },
    {
      chainId: '0x14a34',
      name: 'Base Sepolia',
      symbol: 'ETH',
      rpcUrl: 'https://sepolia.base.org',
      blockExplorerUrl: 'https://sepolia-explorer.base.org',
      color: '#0052FF'
    },
    {
      chainId: '0x13882',
      name: 'Polygon Mumbai',
      symbol: 'MATIC',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      blockExplorerUrl: 'https://mumbai.polygonscan.com',
      color: '#8247E5'
    },
    {
      chainId: '0x61',
      name: 'BSC Testnet',
      symbol: 'tBNB',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      blockExplorerUrl: 'https://testnet.bscscan.com',
      color: '#F3BA2F'
    },
    {
      chainId: '0x66eed',
      name: 'Arbitrum Sepolia',
      symbol: 'ETH',
      rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
      blockExplorerUrl: 'https://sepolia.arbiscan.io',
      color: '#28A0F0'
    },
    {
      chainId: '0xaa37dc',
      name: 'Optimism Sepolia',
      symbol: 'ETH',
      rpcUrl: 'https://sepolia.optimism.io',
      blockExplorerUrl: 'https://sepolia-optimism.etherscan.io',
      color: '#FF0420'
    },
    // Redes adicionales
    {
      chainId: '0x504',
      name: 'Moonbeam',
      symbol: 'GLMR',
      rpcUrl: 'https://rpc.api.moonbeam.network',
      blockExplorerUrl: 'https://moonbeam.moonscan.io',
      color: '#53CBC9'
    },
    {
      chainId: '0x505',
      name: 'Moonriver',
      symbol: 'MOVR',
      rpcUrl: 'https://rpc.api.moonriver.moonbeam.network',
      blockExplorerUrl: 'https://moonriver.moonscan.io',
      color: '#F2B705'
    },
    {
      chainId: '0x2019',
      name: 'Klaytn Mainnet',
      symbol: 'KLAY',
      rpcUrl: 'https://public-node-api.klaytnapi.com/v1/cypress',
      blockExplorerUrl: 'https://scope.klaytn.com',
      color: '#FF6B00'
    }
  ];

  nuevaRed: RedBlockchain = {
    chainId: '',
    name: '',
    symbol: '',
    rpcUrl: '',
    blockExplorerUrl: '',
    color: '#6366F1',
    esPersonalizada: true
  };

  // User data
  usuario: UserProfile = {
    nombre: 'Usuario Crypto',
    email: 'usuario@cryptopay.com',
    telefono: '+51 999 888 777',
    fechaNacimiento: '1990-05-15',
    genero: 'masculino',
    direccion: 'Lima, Perú',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    perfilPublico: true,
    mostrarTelefono: false,
    saldo: 1250.75,
  };

  notificaciones = [
    {
      id: 1,
      tipo: 'pago_recibido',
      titulo: 'Pago recibido',
      mensaje: 'Carlos Mendoza te envió S/ 120.50 por servicios',
      tiempo: 'Hace 5 min',
      leida: false,
    },
    {
      id: 2,
      tipo: 'pago_enviado',
      titulo: 'Pago enviado',
      mensaje: 'Enviaste S/ 50.00 a María González',
      tiempo: 'Hace 2 horas',
      leida: false,
    },
    {
      id: 3,
      tipo: 'promocion',
      titulo: '¡Promoción especial!',
      mensaje: 'Transfiere sin comisión hasta el 31 de enero',
      tiempo: 'Ayer',
      leida: true,
    },
    {
      id: 4,
      tipo: 'sistema',
      titulo: 'Actualización de seguridad',
      mensaje: 'Tu cuenta ha sido verificada exitosamente',
      tiempo: 'Hace 2 días',
      leida: true,
    },
    {
      id: 5,
      tipo: 'pago_recibido',
      titulo: 'Nuevo contacto',
      mensaje: 'Ana Ruiz te agregó como contacto favorito',
      tiempo: 'Hace 3 días',
      leida: false,
    },
  ];

  actividadReciente = [
    {
      id: 1,
      nombre: 'María González',
      descripcion: 'Almuerzo en restaurante',
      monto: -50.0,
      fecha: 'Hoy, 2:30 PM',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 2,
      nombre: 'Carlos Mendoza',
      descripcion: 'Pago por servicios',
      monto: 120.5,
      fecha: 'Ayer, 11:45 AM',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 3,
      nombre: 'Ana Ruiz',
      descripcion: 'Transporte compartido',
      monto: -25.75,
      fecha: '13/1/2024',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  ];

  constructor(
    private router: Router,
    private metamaskService: MetamaskService,
    private userService: UserService
  ) {
    // Cargar redes personalizadas al inicializar
    this.cargarRedesPersonalizadas();
  }

  ngOnInit() {
    // Obtener precio actual de ETH
    this.getETHPrice();

    // Cargar red actual desde localStorage
    this.cargarRedActual();

    // Suscribirse a los cambios del usuario
    this.userService.user$.subscribe((user) => {
      this.usuario = user;
      console.log('👤 Usuario actualizado en inicio:', user);
    });

    // Suscribirse a los cambios de MetaMask
    this.metamaskService.connected$.subscribe((connected) => {
      this.isConnected = connected;
      console.log('🔗 Estado de conexión en inicio:', connected);
      
      if (connected) {
        this.detectarRedActual();
      }
    });

    this.metamaskService.account$.subscribe((account) => {
      this.account = account || '';
    });

    this.metamaskService.balance$.subscribe((balance) => {
      this.balance = balance;
      // Calcular valor en USD
      this.balanceUSD = parseFloat(balance) * this.ethPriceUSD;
      console.log('💰 Balance en inicio:', balance, 'USD:', this.balanceUSD);
    });
  }

  async getETHPrice() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      this.ethPriceUSD = data.ethereum.usd;
      console.log('💵 Precio ETH actualizado:', this.ethPriceUSD);

      // Recalcular balance USD si ya tenemos balance
      if (this.balance !== '0') {
        this.balanceUSD = parseFloat(this.balance) * this.ethPriceUSD;
      }
    } catch (error) {
      console.error('❌ Error obteniendo precio ETH:', error);
      // Usar precio por defecto si falla la API
      this.ethPriceUSD = 2500;
    }
  }

  // Métodos para gestión de redes
  cargarRedActual() {
    const redGuardada = localStorage.getItem('cryptopay_red_actual');
    if (redGuardada) {
      try {
        this.redActual = JSON.parse(redGuardada);
      } catch (error) {
        console.error('Error cargando red actual:', error);
        this.redActual = this.redesDisponibles[0]; // Ethereum por defecto
      }
    } else {
      this.redActual = this.redesDisponibles[0]; // Ethereum por defecto
    }
  }

  guardarRedActual() {
    if (this.redActual) {
      localStorage.setItem('cryptopay_red_actual', JSON.stringify(this.redActual));
    }
  }

  async detectarRedActual() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const redEncontrada = this.redesDisponibles.find(red => red.chainId === chainId);
        
        if (redEncontrada) {
          this.redActual = redEncontrada;
          this.guardarRedActual();
          console.log('🌐 Red detectada:', redEncontrada.name);
        } else {
          console.log('🌐 Red no reconocida:', chainId);
        }
      } catch (error) {
        console.error('Error detectando red:', error);
      }
    }
  }

  abrirModalRedes() {
    this.mostrarModalRedes = true;
    this.mostrarFormularioRed = false;
    this.resetearFormularioRed();
  }

  cerrarModalRedes() {
    this.mostrarModalRedes = false;
    this.mostrarFormularioRed = false;
    this.resetearFormularioRed();
  }

  resetearFormularioRed() {
    this.nuevaRed = {
      chainId: '',
      name: '',
      symbol: '',
      rpcUrl: '',
      blockExplorerUrl: '',
      color: '#6366F1',
      esPersonalizada: true
    };
  }

  async cambiarRed(red: RedBlockchain) {
    if (typeof window.ethereum === 'undefined') {
      this.mostrarMensaje('MetaMask no está instalado');
      return;
    }

    try {
      // Intentar cambiar a la red
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: red.chainId }],
      });

      this.redActual = red;
      this.guardarRedActual();
      this.mostrarMensaje(`Cambiado a ${red.name}`);
      this.cerrarModalRedes();
      
      // Actualizar balance después del cambio
      setTimeout(() => {
        this.refreshBalance();
      }, 1000);

    } catch (switchError: any) {
      // Si la red no está agregada, intentar agregarla
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: red.chainId,
              chainName: red.name,
              nativeCurrency: {
                name: red.symbol,
                symbol: red.symbol,
                decimals: 18,
              },
              rpcUrls: [red.rpcUrl],
              blockExplorerUrls: red.blockExplorerUrl ? [red.blockExplorerUrl] : null,
            }],
          });

          this.redActual = red;
          this.guardarRedActual();
          this.mostrarMensaje(`Red ${red.name} agregada y activada`);
          this.cerrarModalRedes();

        } catch (addError) {
          console.error('Error agregando red:', addError);
          this.mostrarMensaje('Error agregando la red');
        }
      } else {
        console.error('Error cambiando red:', switchError);
        this.mostrarMensaje('Error cambiando de red');
      }
    }
  }

  agregarNuevaRed() {
    if (!this.nuevaRed.name || !this.nuevaRed.rpcUrl || !this.nuevaRed.chainId || !this.nuevaRed.symbol) {
      this.mostrarMensaje('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar que el chainId no exista ya
    const redExistente = this.redesDisponibles.find(red => red.chainId === this.nuevaRed.chainId);
    if (redExistente) {
      this.mostrarMensaje('Ya existe una red con ese Chain ID');
      return;
    }

    // Agregar la nueva red
    const nuevaRed: RedBlockchain = {
      ...this.nuevaRed,
      esPersonalizada: true
    };

    this.redesDisponibles.push(nuevaRed);
    this.guardarRedesPersonalizadas();
    
    this.mostrarMensaje('Red agregada exitosamente');
    this.mostrarFormularioRed = false;
    this.resetearFormularioRed();
  }

  eliminarRed(red: RedBlockchain) {
    if (!red.esPersonalizada) {
      this.mostrarMensaje('No puedes eliminar redes predeterminadas');
      return;
    }

    const index = this.redesDisponibles.findIndex(r => r.chainId === red.chainId);
    if (index > -1) {
      this.redesDisponibles.splice(index, 1);
      this.guardarRedesPersonalizadas();
      this.mostrarMensaje('Red eliminada');

      // Si era la red actual, cambiar a Ethereum
      if (this.redActual?.chainId === red.chainId) {
        this.redActual = this.redesDisponibles[0];
        this.guardarRedActual();
      }
    }
  }

  guardarRedesPersonalizadas() {
    const redesPersonalizadas = this.redesDisponibles.filter(red => red.esPersonalizada);
    localStorage.setItem('cryptopay_redes_personalizadas', JSON.stringify(redesPersonalizadas));
  }

  cargarRedesPersonalizadas() {
    const redesGuardadas = localStorage.getItem('cryptopay_redes_personalizadas');
    if (redesGuardadas) {
      try {
        const redes = JSON.parse(redesGuardadas);
        // Agregar las redes personalizadas a la lista
        redes.forEach((red: RedBlockchain) => {
          if (!this.redesDisponibles.find(r => r.chainId === red.chainId)) {
            this.redesDisponibles.push(red);
          }
        });
      } catch (error) {
        console.error('Error cargando redes personalizadas:', error);
      }
    }
  }

  trackByRed(_index: number, red: RedBlockchain): string {
    return red.chainId;
  }

  getShortAddress(): string {
    return this.metamaskService.getShortAddress(this.account);
  }

  async refreshBalance() {
    console.log('🔄 Refrescando balance desde inicio...');
    await this.metamaskService.refreshBalance();
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  toggleSaldoVisible() {
    this.saldoVisible = !this.saldoVisible;
    // Simular haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  mostrarProximamente() {
    this.mostrarMensaje('Función próximamente disponible');
  }

  trackByTransaccion(_index: number, transaccion: any): number {
    return transaccion.id;
  }

  // Métodos para notificaciones
  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Si se abre el panel, marcar como vistas (pero no leídas)
    if (this.mostrarNotificaciones) {
      this.mostrarMensaje(
        'Tienes ' +
          this.contarNotificacionesNoLeidas() +
          ' notificaciones nuevas'
      );
    }
  }

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  tieneNotificacionesNoLeidas(): boolean {
    return this.notificaciones.some((n) => !n.leida);
  }

  contarNotificacionesNoLeidas(): number {
    return this.notificaciones.filter((n) => !n.leida).length;
  }

  marcarComoLeida(notificacion: any) {
    notificacion.leida = true;

    // Haptic feedback suave
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Mostrar mensaje de la notificación
    this.mostrarMensaje(notificacion.mensaje);
  }

  marcarTodasComoLeidas() {
    const noLeidas = this.contarNotificacionesNoLeidas();
    this.notificaciones.forEach((n) => (n.leida = true));

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }

    this.mostrarMensaje(`${noLeidas} notificaciones marcadas como leídas`);
  }

  trackByNotificacion(_index: number, notificacion: any): number {
    return notificacion.id;
  }

  // Simular nuevas notificaciones (para demo)
  simularNuevaNotificacion() {
    const nuevaNotificacion = {
      id: Date.now(),
      tipo: 'pago_recibido',
      titulo: 'Nuevo pago recibido',
      mensaje: `Recibiste ${this.redActual?.symbol || 'ETH'} ${(Math.random() * 0.1 + 0.01).toFixed(4)} de un contacto`,
      tiempo: 'Ahora',
      leida: false,
    };

    this.notificaciones.unshift(nuevaNotificacion);

    // Haptic feedback fuerte
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    this.mostrarMensaje('¡Nueva notificación recibida!');
  }

  private mostrarMensaje(mensaje: string) {
    const alerta = document.createElement('div');
    alerta.className =
      'fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-lg z-50 transform transition-all duration-300 translate-y-[-100px] mx-auto max-w-sm';
    alerta.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
        <p class="font-medium">${mensaje}</p>
      </div>
    `;

    document.body.appendChild(alerta);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
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
      }, 300);
    }, 2500);
  }
}