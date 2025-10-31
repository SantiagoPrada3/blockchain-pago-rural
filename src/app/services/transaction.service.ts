import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  amountEth: number;
  type: 'sent' | 'received';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  date: Date;
  description?: string;
  contactName?: string;
  contactAvatar?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
}

export interface TransactionSummary {
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
  sentTransactions: number;
  receivedTransactions: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  private summarySubject = new BehaviorSubject<TransactionSummary>({
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: 0,
    sentTransactions: 0,
    receivedTransactions: 0
  });
  public summary$ = this.summarySubject.asObservable();

  constructor() {
    this.loadTransactions();
  }

  // Cargar transacciones desde localStorage
  private loadTransactions() {
    try {
      const stored = localStorage.getItem('cryptopay_transactions');
      if (stored) {
        const transactions: Transaction[] = JSON.parse(stored).map((tx: any) => ({
          ...tx,
          date: new Date(tx.timestamp)
        }));
        this.transactionsSubject.next(transactions);
        this.updateSummary(transactions);
      }
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    }
  }

  // Guardar transacciones en localStorage
  private saveTransactions(transactions: Transaction[]) {
    try {
      localStorage.setItem('cryptopay_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error guardando transacciones:', error);
    }
  }

  // Agregar nueva transacción
  addTransaction(
    hash: string,
    from: string,
    to: string,
    amount: string,
    type: 'sent' | 'received',
    description?: string,
    contactName?: string
  ): Transaction {
    const transaction: Transaction = {
      id: this.generateId(),
      hash,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      amount,
      amountEth: parseFloat(amount),
      type,
      status: 'pending',
      timestamp: Date.now(),
      date: new Date(),
      description,
      contactName,
      contactAvatar: this.generateAvatarUrl(type === 'sent' ? to : from)
    };

    const currentTransactions = this.transactionsSubject.value;
    const updatedTransactions = [transaction, ...currentTransactions];
    
    this.transactionsSubject.next(updatedTransactions);
    this.saveTransactions(updatedTransactions);
    this.updateSummary(updatedTransactions);

    return transaction;
  }

  // Actualizar estado de transacción
  updateTransactionStatus(hash: string, status: 'confirmed' | 'failed', blockNumber?: number) {
    const currentTransactions = this.transactionsSubject.value;
    const updatedTransactions = currentTransactions.map(tx => 
      tx.hash === hash 
        ? { ...tx, status, blockNumber }
        : tx
    );

    this.transactionsSubject.next(updatedTransactions);
    this.saveTransactions(updatedTransactions);
  }

  // Obtener transacciones filtradas por fecha
  getTransactionsByDateRange(days: number): Transaction[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return this.transactionsSubject.value.filter(tx => 
      tx.date >= startDate
    );
  }

  // Obtener transacciones de hoy
  getTodayTransactions(): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.transactionsSubject.value.filter(tx => 
      tx.date >= today
    );
  }

  // Obtener transacciones de la semana
  getWeekTransactions(): Transaction[] {
    return this.getTransactionsByDateRange(7);
  }

  // Obtener transacciones del mes
  getMonthTransactions(): Transaction[] {
    return this.getTransactionsByDateRange(30);
  }

  // Obtener transacciones del año
  getYearTransactions(): Transaction[] {
    return this.getTransactionsByDateRange(365);
  }

  // Obtener todas las transacciones
  getAllTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  // Filtrar transacciones por tipo
  getTransactionsByType(type: 'sent' | 'received'): Transaction[] {
    return this.transactionsSubject.value.filter(tx => tx.type === type);
  }

  // Buscar transacciones
  searchTransactions(query: string): Transaction[] {
    const searchTerm = query.toLowerCase();
    return this.transactionsSubject.value.filter(tx =>
      tx.contactName?.toLowerCase().includes(searchTerm) ||
      tx.description?.toLowerCase().includes(searchTerm) ||
      tx.hash.toLowerCase().includes(searchTerm) ||
      tx.to.toLowerCase().includes(searchTerm) ||
      tx.from.toLowerCase().includes(searchTerm)
    );
  }

  // Actualizar resumen
  private updateSummary(transactions: Transaction[]) {
    const summary: TransactionSummary = {
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: transactions.length,
      sentTransactions: 0,
      receivedTransactions: 0
    };

    transactions.forEach(tx => {
      if (tx.status === 'confirmed') {
        if (tx.type === 'sent') {
          summary.totalSent += tx.amountEth;
          summary.sentTransactions++;
        } else {
          summary.totalReceived += tx.amountEth;
          summary.receivedTransactions++;
        }
      }
    });

    this.summarySubject.next(summary);
  }

  // Limpiar historial
  clearHistory() {
    this.transactionsSubject.next([]);
    localStorage.removeItem('cryptopay_transactions');
    this.updateSummary([]);
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generar URL de avatar
  private generateAvatarUrl(address: string): string {
    const seed = address.toLowerCase();
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  // Obtener dirección corta
  getShortAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Formatear fecha
  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 2) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} días, ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}