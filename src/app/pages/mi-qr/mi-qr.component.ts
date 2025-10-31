import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetamaskService } from '../../services/metamask.service';
import { UserService, UserProfile } from '../../services/user.service';
import * as QRCode from 'qrcode';

interface RedBlockchain {
  chainId: string;
  name: string;
  symbol: string;
  color: string;
}

// Declaración de tipos para MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-mi-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-qr.component.html',
  styleUrls: ['./mi-qr.component.css']
})
export class MiQrComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
  // MetaMask data
  isConnected = false;
  account = '';
  balance = '0';
  redActual: RedBlockchain | null = null;
  
  // User data
  usuario: UserProfile = {
    nombre: 'Usuario Crypto',
    email: 'usuario@cryptopay.com',
    telefono: '+51 999 888 777',
    fechaNacimiento: '1990-05-15',
    genero: 'masculino',
    direccion: 'Lima, Perú',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    perfilPublico: true,
    mostrarTelefono: false,
    saldo: 1250.75,
  };

  constructor(
    public router: Router,
    private metamaskService: MetamaskService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Cargar red actual desde localStorage
    this.cargarRedActual();

    // Suscribirse a los cambios del usuario
    this.userService.user$.subscribe(user => {
      this.usuario = user;
    });

    // Suscribirse a los cambios de MetaMask
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.detectarRedActual();
        // Esperar un poco para que el ViewChild esté disponible
        setTimeout(() => this.generarQR(), 100);
      }
    });

    this.metamaskService.account$.subscribe(account => {
      this.account = account || '';
      if (this.account) {
        // Esperar un poco para que el ViewChild esté disponible
        setTimeout(() => this.generarQR(), 100);
      }
    });

    this.metamaskService.balance$.subscribe(balance => {
      this.balance = balance;
    });
  }

  ngAfterViewInit() {
    // Para pruebas, usar una dirección de ejemplo si no hay MetaMask
    if (!this.account) {
      this.account = '0xd27dc71d8863cac36f3acb49043480e22ea3edf6';
      this.isConnected = true;
    }
    
    // Generar QR después de que la vista esté lista
    setTimeout(() => {
      this.generarQR();
    }, 500);
  }

  cargarRedActual() {
    const redGuardada = localStorage.getItem('cryptopay_red_actual');
    if (redGuardada) {
      try {
        this.redActual = JSON.parse(redGuardada);
      } catch (error) {
        console.error('Error cargando red actual:', error);
        this.redActual = {
          chainId: '0x1',
          name: 'Ethereum Mainnet',
          symbol: 'ETH',
          color: '#627EEA'
        };
      }
    } else {
      this.redActual = {
        chainId: '0x1',
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        color: '#627EEA'
      };
    }
  }

  async detectarRedActual() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Lista de redes conocidas
        const redesConocidas: RedBlockchain[] = [
          { chainId: '0x1', name: 'Ethereum Mainnet', symbol: 'ETH', color: '#627EEA' },
          { chainId: '0x89', name: 'Polygon Mainnet', symbol: 'MATIC', color: '#8247E5' },
          { chainId: '0x38', name: 'BSC Mainnet', symbol: 'BNB', color: '#F3BA2F' },
          { chainId: '0xa4b1', name: 'Arbitrum One', symbol: 'ETH', color: '#28A0F0' },
          { chainId: '0xa', name: 'Optimism', symbol: 'ETH', color: '#FF0420' },
          { chainId: '0x2105', name: 'Base Mainnet', symbol: 'ETH', color: '#0052FF' },
          { chainId: '0xe708', name: 'Linea', symbol: 'ETH', color: '#00D4FF' },
          { chainId: '0xaa36a7', name: 'Sepolia', symbol: 'SepoliaETH', color: '#9B59B6' },
          { chainId: '0x4268', name: 'Holesky', symbol: 'ETH', color: '#F7931A' },
          { chainId: '0x59140', name: 'Linea Sepolia', symbol: 'ETH', color: '#00D4FF' },
          { chainId: '0x14a34', name: 'Base Sepolia', symbol: 'ETH', color: '#0052FF' }
        ];
        
        const redEncontrada = redesConocidas.find(red => red.chainId === chainId);
        
        if (redEncontrada) {
          this.redActual = redEncontrada;
          localStorage.setItem('cryptopay_red_actual', JSON.stringify(this.redActual));
          console.log('🌐 Red detectada:', redEncontrada.name);
        } else {
          console.log('🌐 Red no reconocida:', chainId);
        }
      } catch (error) {
        console.error('Error detectando red:', error);
      }
    }
  }

  async generarQR() {
    console.log('🔄 Iniciando generación de QR...');
    console.log('📍 Dirección:', this.account);
    console.log('🖼️ Canvas disponible:', !!this.qrCanvas?.nativeElement);

    if (!this.account) {
      console.log('❌ No hay dirección disponible');
      return;
    }

    if (!this.qrCanvas?.nativeElement) {
      console.log('❌ Canvas no está disponible');
      return;
    }

    try {
      const canvas = this.qrCanvas.nativeElement;
      console.log('🎨 Canvas obtenido:', canvas.width, 'x', canvas.height);
      
      // Primero dibujar algo simple para probar el canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Borde negro para ver que funciona
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        console.log('🎨 Canvas preparado');
      }
      
      // Ahora generar el QR
      console.log('📱 Generando QR con librería...');
      await QRCode.toCanvas(canvas, this.account, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('✅ QR generado exitosamente!');
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      
      // Fallback: mostrar texto en el canvas
      const canvas = this.qrCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.fillText('Error QR', 100, 140);
      }
    }
  }

  getShortAddress(): string {
    return this.metamaskService.getShortAddress(this.account);
  }

  async copiarDireccion() {
    if (!this.account) {
      this.mostrarAlerta('No hay dirección para copiar');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.account);
      this.mostrarAlerta('Dirección copiada al portapapeles');
    } catch (error) {
      console.error('Error copiando dirección:', error);
      this.mostrarAlerta('Error copiando la dirección');
    }
  }

  async compartirQR() {
    if (!this.account) {
      this.mostrarAlerta('Conecta tu wallet primero');
      return;
    }

    try {
      // Obtener URL del explorador correcto
      let explorerUrl = 'https://etherscan.io/address/';
      
      if (this.redActual) {
        const explorers: { [key: string]: string } = {
          '0x1': 'https://etherscan.io/address/',           // Ethereum Mainnet
          '0x89': 'https://polygonscan.com/address/',       // Polygon
          '0x38': 'https://bscscan.com/address/',           // BSC
          '0xa4b1': 'https://arbiscan.io/address/',         // Arbitrum
          '0xa': 'https://optimistic.etherscan.io/address/', // Optimism
          '0x2105': 'https://basescan.org/address/',        // Base
          '0xe708': 'https://lineascan.build/address/',     // Linea
          '0xaa36a7': 'https://sepolia.etherscan.io/address/', // Sepolia
          '0x4268': 'https://holesky.etherscan.io/address/', // Holesky
          '0x5': 'https://goerli.etherscan.io/address/',    // Goerli
          '0x13881': 'https://mumbai.polygonscan.com/address/' // Polygon Mumbai
        };
        
        explorerUrl = explorers[this.redActual.chainId] || explorerUrl;
      }

      if (navigator.share) {
        await navigator.share({
          title: `Mi dirección ${this.redActual?.name || 'Ethereum'}`,
          text: `Mi dirección de wallet: ${this.account}`,
          url: `${explorerUrl}${this.account}`
        });
      } else {
        // Fallback: copiar al portapapeles
        await this.copiarDireccion();
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
      this.mostrarAlerta('Error compartiendo QR');
    }
  }

  async descargarQR() {
    if (!this.account || !this.qrCanvas) {
      this.mostrarAlerta('No hay QR para descargar');
      return;
    }

    try {
      const canvas = this.qrCanvas.nativeElement;
      const link = document.createElement('a');
      link.download = `qr-${this.redActual?.name || 'ethereum'}-${this.getShortAddress()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      this.mostrarAlerta('QR descargado exitosamente');
    } catch (error) {
      console.error('Error descargando QR:', error);
      this.mostrarAlerta('Error descargando QR');
    }
  }

  mostrarAlerta(mensaje: string) {
    const alerta = document.createElement('div');
    alerta.className = 'fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-lg z-50 transform transition-transform duration-300 translate-y-[-100px] mx-auto max-w-sm';
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
        if (document.body.contains(alerta)) {
          document.body.removeChild(alerta);
        }
      }, 300);
    }, 2500);
  }

  // Cambiar a red Holesky
  async cambiarAHolesky() {
    try {
      const success = await this.metamaskService.switchNetwork('0x4268');
      if (success) {
        this.mostrarAlerta('Cambiado a red Holesky exitosamente');
        // Esperar un poco y detectar la nueva red
        setTimeout(() => {
          this.detectarRedActual();
        }, 1000);
      } else {
        this.mostrarAlerta('Error cambiando a red Holesky');
      }
    } catch (error) {
      console.error('Error cambiando red:', error);
      this.mostrarAlerta('Error cambiando de red');
    }
  }

  volver() {
    this.router.navigate(['/inicio']);
  }
}