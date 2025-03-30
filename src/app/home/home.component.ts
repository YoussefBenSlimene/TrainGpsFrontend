import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h2>Welcome to Train GPS</h2>
      <p>Your journey starts here</p>
      <!-- Add your home content here -->
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 1rem;
        height: 100%;
      }
      h2 {
        color: #1976d2;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class HomeComponent {}
