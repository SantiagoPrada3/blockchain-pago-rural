// src/app/services/metamask.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContactService } from './contact.service';
import { TransactionService } from './transaction.service';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private accountSubject = new BehaviorSubject<string | null>(null);
  public account$ = this.accountSubject.asObservable();

  private balanceSubject = new BehaviorSubject<string>('0');
  public balance$ = this.balanceSubject.asObservable();

  private web3: any;

  constructor(
    private contactService: ContactService,
    private transactionService: TransactionService
  ) {
    this.checkMetaMaskConnection();
    this.setupEventListeners();
  }

  // Verificar si MetaMask está instalado
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  // Verificar conexión existente
  private async checkMetaMaskConnection() {
    if (this.isMetaMaskInstalled()) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          await this.initializeWeb3();
          this.accountSubject.next(accounts[0]);
          this.connectedSubject.next(true);
          await this.refreshBalance();
          await this.importContacts();
        }
      } catch (error) {
        console.error('Error verificando conexión:', error);
      }
    }
  }

  // Inicializar Web3
  private async initializeWeb3() {
    if (typeof window.Web3 === 'undefined') {
      // Cargar Web3 dinámicamente
      const Web3 = (await import('web3')).default;
      this.web3 = new Web3(window.ethereum);
    } else {
      this.web3 = new window.Web3(window.ethereum);
    }
  }

  // Conectar wallet
  async connectWallet(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      alert('Por favor instala MetaMask para continuar');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    try {
      await this.initializeWeb3();

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.accountSubject.next(accounts[0]);
        this.connectedSubject.next(true);
        await this.refreshBalance();
        await this.importContacts();

        console.log('✅ Conectado a MetaMask');
        console.log('👤 Cuenta:', accounts[0]);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error conectando wallet:', error);

      if (error.code === 4001) {
        alert('Conexión rechazada por el usuario');
      } else {
        alert('Error conectando con MetaMask');
      }

      return false;
    }
  }

  // Desconectar wallet
  disconnect() {
    this.accountSubject.next(null);
    this.balanceSubject.next('0');
    this.connectedSubject.next(false);
    console.log('🔌 Desconectado de MetaMask');
  }

  // Refrescar balance
  async refreshBalance() {
    const account = this.accountSubject.value;
    if (!account || !this.web3) return;

    try {
      const balanceWei = await this.web3.eth.getBalance(account);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      const balanceFormatted = parseFloat(balanceEth).toFixed(4);

      this.balanceSubject.next(balanceFormatted);
      console.log('💰 Balance actualizado:', balanceFormatted, 'ETH');
    } catch (error) {
      console.error('Error obteniendo balance:', error);
    }
  }

  // Enviar transacción ETH
  async sendTransaction(
    toAddress: string,
    amountEth: string
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    const account = this.accountSubject.value;
    if (!account || !this.web3) {
      return {
        success: false,
        error: 'Wallet no conectada'
      };
    }

    try {
      console.log('🚀 Iniciando transacción...');
      console.log('📍 Desde:', account);
      console.log('📍 Hacia:', toAddress);
      console.log('💰 Monto:', amountEth, 'ETH');

      // Validar dirección
      if (!this.web3.utils.isAddress(toAddress)) {
        return {
          success: false,
          error: 'Dirección de destino inválida'
        };
      }

      // Validar monto
      const amount = parseFloat(amountEth);
      if (isNaN(amount) || amount <= 0) {
        return {
          success: false,
          error: 'Monto inválido'
        };
      }

      // Convertir ETH a Wei de forma segura
      let amountWei: string;
      try {
        amountWei = this.web3.utils.toWei(amountEth.toString(), 'ether');
        console.log('💱 Conversión ETH->Wei:', amountEth, 'ETH =', amountWei, 'Wei');
      } catch (conversionError) {
        console.error('❌ Error en conversión:', conversionError);
        return {
          success: false,
          error: 'Error en conversión de monto'
        };
      }

      // Obtener balance actual
      const balanceWei = await this.web3.eth.getBalance(account);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      console.log('💰 Balance actual:', balanceEth, 'ETH');

      // Verificación básica de balance
      if (parseFloat(balanceEth) < amount) {
        return {
          success: false,
          error: `Balance insuficiente. Tienes ${parseFloat(balanceEth).toFixed(4)} ETH, intentas enviar ${amount} ETH`
        };
      }

      // Preparar parámetros de transacción
      const txParams = {
        from: account,
        to: toAddress,
        value: this.web3.utils.toHex(amountWei),
        // Usar gas límite fijo para evitar errores de estimación
        gas: this.web3.utils.toHex(21000), // Gas estándar para transferencia ETH
      };

      console.log('📋 Parámetros de transacción:', txParams);

      // Enviar transacción directamente sin estimación compleja
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      console.log('✅ Transacción enviada exitosamente!');
      console.log('🔗 Hash:', txHash);

      // Agregar transacción al historial
      try {
        const contacto = this.contactService.addOrUpdateContact(toAddress);
        this.transactionService.addTransaction(
          txHash,
          account,
          toAddress,
          amountEth,
          'sent',
          undefined,
          contacto.nombre
        );
        console.log('📝 Transacción agregada al historial');
      } catch (historyError) {
        console.error('⚠️ Error agregando al historial:', historyError);
        // No fallar la transacción por esto
      }

      // Esperar confirmación en background
      this.waitForTransaction(txHash)
        .then(() => {
          console.log('✅ Transacción confirmada');
          this.transactionService.updateTransactionStatus(txHash, 'confirmed');
          this.refreshBalance();
        })
        .catch((confirmError) => {
          console.error('❌ Error en confirmación:', confirmError);
          this.transactionService.updateTransactionStatus(txHash, 'failed');
        });

      return {
        success: true,
        hash: txHash
      };

    } catch (error: any) {
      console.error('❌ Error completo enviando transacción:', error);

      let errorMessage = 'Error al enviar transacción';

      if (error.code === 4001) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (error.code === -32603) {
        errorMessage = 'Error interno de MetaMask';
      } else if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para gas';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Error relacionado con gas';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Esperar confirmación de transacción
  private async waitForTransaction(txHash: string): Promise<void> {
    return new Promise((resolve) => {
      const checkTransaction = async () => {
        try {
          const receipt = await this.web3.eth.getTransactionReceipt(txHash);
          if (receipt) {
            console.log('✅ Transacción confirmada:', receipt);
            resolve();
          } else {
            setTimeout(checkTransaction, 2000);
          }
        } catch (error) {
          console.error('Error verificando transacción:', error);
          setTimeout(checkTransaction, 2000);
        }
      };
      checkTransaction();
    });
  }

  // Importar contactos del historial
  async importContacts() {
    const account = this.accountSubject.value;
    if (!account || !this.web3) return;

    try {
      await this.contactService.importContactsFromTransactionHistory(
        this.web3,
        account
      );
    } catch (error) {
      console.error('Error importando contactos:', error);
    }
  }

  // Obtener red actual
  async getCurrentNetwork(): Promise<string> {
    if (!this.web3) return 'Desconocida';

    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      const networks: { [key: string]: string } = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Polygon Mumbai',
        '0xa4b1': 'Arbitrum One',
        '0xa': 'Optimism',
        '0x4268': 'Holesky Testnet',
        '0xaa36a7': 'Sepolia Testnet'
      };

      const networkName = networks[chainId] || `Red desconocida (${chainId})`;
      console.log('🌐 Red actual:', networkName);
      return networkName;
    } catch (error) {
      console.error('Error obteniendo red:', error);
      return 'Error';
    }
  }

  // Cambiar de red
  async switchNetwork(chainId: string): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return true;
    } catch (error: any) {
      console.error('Error cambiando de red:', error);

      // Si la red no existe, intentar agregarla
      if (error.code === 4902) {
        return await this.addNetwork(chainId);
      }

      return false;
    }
  }

  // Agregar red a MetaMask
  async addNetwork(chainId: string): Promise<boolean> {
    try {
      const networks: { [key: string]: any } = {
        '0x4268': {
          chainId: '0x4268',
          chainName: 'Holesky Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://holesky.drpc.org'],
          blockExplorerUrls: ['https://holesky.etherscan.io']
        },
        '0xaa36a7': {
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }
      };

      const networkConfig = networks[chainId];
      if (!networkConfig) {
        console.error('Red no soportada:', chainId);
        return false;
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });

      return true;
    } catch (error) {
      console.error('Error agregando red:', error);
      return false;
    }
  }

  // Escuchar eventos de MetaMask
  private setupEventListeners() {
    if (!this.isMetaMaskInstalled()) return;

    // Cambio de cuenta
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.accountSubject.next(accounts[0]);
        this.refreshBalance();
        this.importContacts();
        console.log('👤 Cuenta cambiada:', accounts[0]);
      }
    });

    // Cambio de red
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    // Desconexión
    window.ethereum.on('disconnect', () => {
      this.disconnect();
    });
  }

  // Obtener dirección corta
  getShortAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Método de transacción forzada (más simple)
  async sendTransactionForced(
    toAddress: string,
    amountEth: string
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    const account = this.accountSubject.value;
    if (!account) {
      return { success: false, error: 'Wallet no conectada' };
    }

    try {
      console.log('🚀 TRANSACCIÓN FORZADA');
      console.log('📍 Desde:', account);
      console.log('📍 Hacia:', toAddress);
      console.log('💰 Monto:', amountEth, 'ETH');

      // Validación mínima
      if (!toAddress || toAddress.length !== 42 || !toAddress.startsWith('0x')) {
        return { success: false, error: 'Dirección inválida' };
      }

      const amount = parseFloat(amountEth);
      if (isNaN(amount) || amount <= 0) {
        return { success: false, error: 'Monto inválido' };
      }

      // Usar directamente la API de MetaMask sin Web3
      const amountWei = (amount * Math.pow(10, 18)).toString(16);

      console.log('💱 Monto en Wei (hex):', '0x' + amountWei);

      const txParams = {
        from: account,
        to: toAddress,
        value: '0x' + amountWei,
        gas: '0x5208', // 21000 en hex
      };

      console.log('📋 Parámetros finales:', txParams);

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      console.log('✅ Transacción forzada exitosa:', txHash);

      // Agregar al historial
      try {
        const contacto = this.contactService.addOrUpdateContact(toAddress);
        this.transactionService.addTransaction(
          txHash,
          account,
          toAddress,
          amountEth,
          'sent',
          'Transacción forzada',
          contacto.nombre
        );
      } catch (e) {
        console.warn('No se pudo agregar al historial:', e);
      }

      // Actualizar balance después de un tiempo
      setTimeout(() => this.refreshBalance(), 2000);

      return { success: true, hash: txHash };

    } catch (error: any) {
      console.error('❌ Error en transacción forzada:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  // Obtener instancia de Web3 (para uso externo)
  getWeb3() {
    return this.web3;
  }
}