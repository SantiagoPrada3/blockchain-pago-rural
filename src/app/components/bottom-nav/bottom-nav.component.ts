import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetamaskService } from '../../services/metamask.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css']
})
export class BottomNavComponent implements OnInit {
  isConnected = false;

  constructor(
    private router: Router,
    private metamaskService: MetamaskService
  ) {}

  ngOnInit() {
    this.metamaskService.connected$.subscribe(connected => {
      this.isConnected = connected;
    });
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}