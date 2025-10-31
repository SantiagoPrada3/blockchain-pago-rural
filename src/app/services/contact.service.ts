// src/app/services/contact.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Contact {
  address: string;
  nombre: string;
  avatar: string;
  telefono?: string;
  esFavorito: boolean;
  transaccionesRealizadas: number;
  ultimaTransaccion?: Date;
  balance?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  private STORAGE_KEY = 'metamask_contacts';
  private FAVORITES_KEY = 'metamask_favorites';

  constructor() {
    this.loadContactsFromStorage();
  }

  // Cargar contactos del localStorage
  private loadContactsFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const contacts = JSON.parse(stored);
        this.contactsSubject.next(contacts);
      }
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  }

  // Guardar contactos en localStorage
  private saveContactsToStorage(contacts: Contact[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error guardando contactos:', error);
    }
  }

  // Obtener todos los contactos
  getContacts(): Contact[] {
    return this.contactsSubject.value;
  }

  // Agregar o actualizar contacto
  addOrUpdateContact(address: string, nombre?: string): Contact {
    const contacts = this.getContacts();
    const existingIndex = contacts.findIndex(c => 
      c.address.toLowerCase() === address.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Actualizar contacto existente
      contacts[existingIndex].transaccionesRealizadas++;
      contacts[existingIndex].ultimaTransaccion = new Date();
      
      // Auto-promover a favorito después de 3 transacciones
      if (contacts[existingIndex].transaccionesRealizadas >= 3) {
        contacts[existingIndex].esFavorito = true;
      }
      
      this.contactsSubject.next(contacts);
      this.saveContactsToStorage(contacts);
      return contacts[existingIndex];
    } else {
      // Crear nuevo contacto
      const newContact: Contact = {
        address,
        nombre: nombre || this.getShortAddress(address),
        avatar: this.generateAvatarUrl(address),
        esFavorito: false,
        transaccionesRealizadas: 1,
        ultimaTransaccion: new Date()
      };

      contacts.push(newContact);
      this.contactsSubject.next(contacts);
      this.saveContactsToStorage(contacts);
      return newContact;
    }
  }

  // Alternar favorito
  toggleFavorite(address: string): void {
    const contacts = this.getContacts();
    const contact = contacts.find(c => 
      c.address.toLowerCase() === address.toLowerCase()
    );

    if (contact) {
      contact.esFavorito = !contact.esFavorito;
      this.contactsSubject.next(contacts);
      this.saveContactsToStorage(contacts);
    }
  }

  // Obtener favoritos
  getFavorites(): Contact[] {
    return this.getContacts().filter(c => c.esFavorito);
  }

  // Actualizar nombre de contacto
  updateContactName(address: string, nombre: string): void {
    const contacts = this.getContacts();
    const contact = contacts.find(c => 
      c.address.toLowerCase() === address.toLowerCase()
    );

    if (contact) {
      contact.nombre = nombre;
      this.contactsSubject.next(contacts);
      this.saveContactsToStorage(contacts);
    }
  }

  // Actualizar balance de contacto
  async updateContactBalance(address: string, web3: any): Promise<void> {
    try {
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      
      const contacts = this.getContacts();
      const contact = contacts.find(c => 
        c.address.toLowerCase() === address.toLowerCase()
      );

      if (contact) {
        contact.balance = parseFloat(balanceEth).toFixed(4);
        this.contactsSubject.next(contacts);
        this.saveContactsToStorage(contacts);
      }
    } catch (error) {
      console.error('Error actualizando balance del contacto:', error);
    }
  }

  // Generar URL de avatar basado en la dirección
  private generateAvatarUrl(address: string): string {
    // Usar DiceBear API para generar avatares consistentes
    const seed = address.toLowerCase();
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  // Obtener dirección corta
  private getShortAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Eliminar contacto
  deleteContact(address: string): void {
    const contacts = this.getContacts().filter(c => 
      c.address.toLowerCase() !== address.toLowerCase()
    );
    this.contactsSubject.next(contacts);
    this.saveContactsToStorage(contacts);
  }

  // Importar contactos desde el historial de transacciones
  async importContactsFromTransactionHistory(
    web3: any, 
    userAddress: string
  ): Promise<void> {
    try {
      // Obtener el número del bloque actual
      const currentBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Últimos ~10000 bloques

      // Obtener transacciones enviadas
      const sentTransactions = await web3.eth.getPastLogs({
        fromBlock: fromBlock,
        toBlock: 'latest',
        topics: [
          null,
          web3.utils.padLeft(userAddress, 64)
        ]
      });

      // Obtener transacciones recibidas
      const receivedTransactions = await web3.eth.getPastLogs({
        fromBlock: fromBlock,
        toBlock: 'latest',
        topics: [
          null,
          null,
          web3.utils.padLeft(userAddress, 64)
        ]
      });

      // Procesar direcciones únicas
      const uniqueAddresses = new Set<string>();
      
      // Procesar transacciones enviadas
      for (const tx of sentTransactions) {
        const toAddress = '0x' + tx.topics[2].slice(26);
        if (toAddress.toLowerCase() !== userAddress.toLowerCase()) {
          uniqueAddresses.add(toAddress);
        }
      }

      // Procesar transacciones recibidas
      for (const tx of receivedTransactions) {
        const fromAddress = '0x' + tx.topics[1].slice(26);
        if (fromAddress.toLowerCase() !== userAddress.toLowerCase()) {
          uniqueAddresses.add(fromAddress);
        }
      }

      // Agregar contactos encontrados
      for (const address of uniqueAddresses) {
        this.addOrUpdateContact(address);
      }

      console.log(`✅ Importados ${uniqueAddresses.size} contactos del historial`);
    } catch (error) {
      console.error('Error importando contactos:', error);
    }
  }

  // Limpiar todos los contactos
  clearAllContacts(): void {
    this.contactsSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}