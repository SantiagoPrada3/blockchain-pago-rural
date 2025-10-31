import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction, TransactionSummary } from '../../services/transaction.service';
import { MetamaskService } from '../../services/metamask.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  Math = Math;
  
  // Datos reales
  transacciones: Transaction[] = [];
  resumen: TransactionSummary = {
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: 0,
    sentTransactions: 0,
    receivedTransactions: 0
  };

  // Filtros
  filtroTipo = 'todos'; // todos, sent, received
  filtroFecha = 'todos'; // todos, hoy, semana, mes, año
  busqueda = '';
  
  // Estado
  isConnected = false;
  isLoading = false;

  constructor(
    private transactionService: TransactionService,
    private metamaskService: MetamaskService
  ) {}

  ngOnInit() {
    // Verificar conexión
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
    });

    // Suscribirse a transacciones
    this.transactionService.transactions$.subscribe(transactions => {
      this.transacciones = transactions;
      this.aplicarFiltros();
    });

    // Suscribirse al resumen
    this.transactionService.summary$.subscribe(summary => {
      this.resumen = summary;
    });
  }

  get transaccionesFiltradas(): Transaction[] {
    let filtradas = [...this.transacciones];

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      filtradas = filtradas.filter(tx => tx.type === this.filtroTipo);
    }

    // Filtro por fecha
    switch (this.filtroFecha) {
      case 'hoy':
        filtradas = this.transactionService.getTodayTransactions();
        break;
      case 'semana':
        filtradas = this.transactionService.getWeekTransactions();
        break;
      case 'mes':
        filtradas = this.transactionService.getMonthTransactions();
        break;
      case 'año':
        filtradas = this.transactionService.getYearTransactions();
        break;
      default:
        // todos - no filtrar
        break;
    }

    // Aplicar filtro de tipo después del filtro de fecha
    if (this.filtroTipo !== 'todos') {
      filtradas = filtradas.filter(tx => tx.type === this.filtroTipo);
    }

    // Filtro por búsqueda
    if (this.busqueda.trim()) {
      filtradas = this.transactionService.searchTransactions(this.busqueda);
      
      // Aplicar otros filtros después de la búsqueda
      if (this.filtroTipo !== 'todos') {
        filtradas = filtradas.filter(tx => tx.type === this.filtroTipo);
      }
    }

    return filtradas.sort((a, b) => b.timestamp - a.timestamp);
  }

  get descripcionFiltroFecha(): string {
    const total = this.transaccionesFiltradas.length;
    
    switch (this.filtroFecha) {
      case 'hoy':
        return `Hoy • ${total} operaciones`;
      case 'semana':
        return `Últimos 7 días • ${total} operaciones`;
      case 'mes':
        return `Último mes • ${total} operaciones`;
      case 'año':
        return `Último año • ${total} operaciones`;
      default:
        return `Todo el tiempo • ${total} operaciones`;
    }
  }

  cambiarFiltroTipo(filtro: string) {
    this.filtroTipo = filtro;
  }

  cambiarFiltroFecha(filtro: string) {
    this.filtroFecha = filtro;
  }

  private aplicarFiltros() {
    // Método para forzar actualización de filtros
    // Se ejecuta cuando cambian las transacciones
  }

  // Obtener nombre para mostrar
  getNombreTransaccion(tx: Transaction): string {
    return tx.contactName || this.transactionService.getShortAddress(
      tx.type === 'sent' ? tx.to : tx.from
    );
  }

  // Obtener descripción para mostrar
  getDescripcionTransaccion(tx: Transaction): string {
    if (tx.description) {
      return tx.description;
    }
    
    return tx.type === 'sent' 
      ? 'Pago enviado'
      : 'Pago recibido';
  }

  // Obtener fecha formateada
  getFechaFormateada(tx: Transaction): string {
    return this.transactionService.formatDate(tx.date);
  }

  // Obtener estado de la transacción
  getEstadoTransaccion(tx: Transaction): string {
    switch (tx.status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'failed':
        return 'Fallida';
      default:
        return 'Desconocido';
    }
  }

  // Copiar hash de transacción
  copiarHash(hash: string, event: Event) {
    event.stopPropagation();
    
    navigator.clipboard.writeText(hash).then(() => {
      this.mostrarNotificacion('Hash copiado al portapapeles', 'success');
    }).catch(() => {
      this.mostrarNotificacion('Error al copiar hash', 'error');
    });
  }

  // Ver en explorador
  async verEnExplorador(hash: string, event: Event) {
    event.stopPropagation();
    
    try {
      // Detectar red actual
      let explorerUrl = 'https://etherscan.io/tx/';
      
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Mapear exploradores por red
        const explorers: { [key: string]: string } = {
          '0x1': 'https://etherscan.io/tx/',           // Ethereum Mainnet
          '0x89': 'https://polygonscan.com/tx/',       // Polygon
          '0x38': 'https://bscscan.com/tx/',           // BSC
          '0xa4b1': 'https://arbiscan.io/tx/',         // Arbitrum
          '0xa': 'https://optimistic.etherscan.io/tx/', // Optimism
          '0x2105': 'https://basescan.org/tx/',        // Base
          '0xe708': 'https://lineascan.build/tx/',     // Linea
          '0xaa36a7': 'https://sepolia.etherscan.io/tx/', // Sepolia
          '0x4268': 'https://holesky.etherscan.io/tx/', // Holesky
          '0x5': 'https://goerli.etherscan.io/tx/',    // Goerli
          '0x13881': 'https://mumbai.polygonscan.com/tx/' // Polygon Mumbai
        };
        
        explorerUrl = explorers[chainId] || explorerUrl;
        console.log('🔍 Abriendo explorador para red:', chainId, 'URL:', explorerUrl);
      }
      
      const url = `${explorerUrl}${hash}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error detectando red:', error);
      // Fallback a Etherscan
      const url = `https://etherscan.io/tx/${hash}`;
      window.open(url, '_blank');
    }
  }

  // Limpiar historial
  limpiarHistorial() {
    const confirmar = confirm(
      '¿Estás seguro de eliminar todo el historial de transacciones?'
    );
    
    if (confirmar) {
      this.transactionService.clearHistory();
      this.mostrarNotificacion('Historial eliminado', 'success');
    }
  }

  // Exportar historial
  exportarHistorial() {
    const data = {
      resumen: this.resumen,
      transacciones: this.transacciones,
      exportado: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial-cryptopay-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.mostrarNotificacion('Historial exportado', 'success');
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
}