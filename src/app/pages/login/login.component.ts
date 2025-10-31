import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetamaskService } from '../../services/metamask.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isConnecting = false;
  isConnected = false;
  account = '';
  balance = '0';
  error = '';

  constructor(
    private router: Router,
    private metamaskService: MetamaskService
  ) {}

  ngOnInit() {
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 1500);
      }
    });

    this.metamaskService.account$.subscribe(account => {
      this.account = account || '';
    });

    this.metamaskService.balance$.subscribe(balance => {
      this.balance = balance;
    });
  }

  async connectWallet() {
    this.isConnecting = true;
    this.error = '';

    try {
      const success = await this.metamaskService.connectWallet();

      if (success) {
        // Simular haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        this.error = 'No se pudo conectar a MetaMask';
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      this.error = 'Error al conectar con MetaMask';
    } finally {
      this.isConnecting = false;
    }
  }

  getShortAddress(): string {
    return this.metamaskService.getShortAddress(this.account);
  }
}