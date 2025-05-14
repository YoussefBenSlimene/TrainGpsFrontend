import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MapComponent } from './map/map.component';
import { WebSocketReaderService } from './web-socket-reader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'my-train-gps-app';
  trains: any[] = [];
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private router: Router,
    private webSocketReaderService: WebSocketReaderService
  ) {}
  ngOnInit() {
    // Log navigation events to help debug routing issues
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log('Navigation completed:', event.url);
      });

    // Wait for all components to be initialized
    setTimeout(() => {
      this.setupEventListeners();
      // Initial data load
      this.refreshTrains();
    }, 1000);
  }

  setupEventListeners() {
    console.log('Setting up event listeners for control buttons');

    // Map control buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const refreshMapBtn = document.getElementById('refresh-map-btn');
    const refreshBtn = document.querySelector('.refresh-btn');
    const showAllBtn = document.querySelector('.show-all-btn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        if (this.mapComponent) {
          this.mapComponent.zoomIn();
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        if (this.mapComponent) {
          this.mapComponent.zoomOut();
        }
      });
    }

    if (refreshMapBtn) {
      refreshMapBtn.addEventListener('click', () => {
        this.refreshTrains();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshTrains();
      });
    }

    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        // Call showAllTrains on the MapComponent
        if (this.mapComponent && this.mapComponent.showAllTrains) {
          this.mapComponent.showAllTrains();
        }
      });
    }
  }
  refreshTrains() {
    console.log('Refreshing trains data...');

    // Request trains data from the server
    this.webSocketReaderService.requestTrainsUpdate();

    // If not already subscribed, subscribe to train updates to populate the side menu
    const subscription = this.webSocketReaderService
      .getTrainsUpdates()
      .subscribe({
        next: (trains) => {
          if (trains.size > 0) {
            console.log(`Received ${trains.size} trains from WebSocket`);
            this.trains = Array.from(trains.values());
            this.updateTrainsInSideMenu();
          }
        },
        error: (err) => {
          console.error('Error receiving train updates:', err);

          // If we have a WebSocket error, try to reconnect
          setTimeout(() => {
            this.webSocketReaderService.requestTrainsUpdate();
          }, 2000);
        },
      });

    // Clean up subscription after 5 seconds to prevent multiple subscriptions
    setTimeout(() => {
      if (subscription) {
        subscription.unsubscribe();
      }
    }, 5000);
  }
  updateTrainsInSideMenu() {
    // Update the trains in the side menu
    const statusList = document.querySelector('.status-list');
    if (!statusList) {
      console.error('Status list element not found');
      return;
    }

    if (this.trains.length === 0) {
      console.warn('No trains available to display');
      statusList.innerHTML = '<div class="no-trains">No trains available</div>';
      return;
    }

    // Keep track of existing train IDs to avoid unnecessary DOM operations
    const existingTrainIds = new Set();
    statusList.querySelectorAll('.status-item').forEach((item) => {
      const id = item.getAttribute('data-train-id');
      if (id) existingTrainIds.add(id);
    });

    // Process each train
    this.trains.forEach((train) => {
      const trainId = train.id.toString();

      // Skip if this train already exists in the DOM
      if (existingTrainIds.has(trainId)) {
        existingTrainIds.delete(trainId); // Remove from set to track which ones to keep
        return;
      }

      // Create new train item
      const item = document.createElement('div');
      item.className = 'status-item';
      item.setAttribute('data-train-id', trainId);

      // Create elements with better structure
      const statusCircle = document.createElement('div');
      statusCircle.className = 'status-circle';
      statusCircle.style.backgroundColor = train.color || '#1976d2';

      const trainButton = document.createElement('button');
      trainButton.className = 'train-btn';
      trainButton.setAttribute('id', `train-${trainId}`);
      trainButton.setAttribute(
        'aria-label',
        `Focus on ${train.name || 'Unnamed Train'}`
      );

      const trainName = document.createElement('span');
      trainName.className = 'train-name';
      trainName.textContent = train.name || 'Unnamed Train';

      const routeInfo = document.createElement('span');
      routeInfo.className = 'route';
      routeInfo.textContent = `${train.departurePlace || 'Unknown'} → ${
        train.destinationPlace || 'Unknown'
      }`;

      // Assemble the elements
      trainButton.appendChild(trainName);
      trainButton.appendChild(routeInfo);

      const statusInfo = document.createElement('div');
      statusInfo.className = 'status-info';
      statusInfo.appendChild(trainButton);

      item.appendChild(statusCircle);
      item.appendChild(statusInfo);

      // Add click handler to focus on this train
      item.addEventListener('click', () => {
        if (this.mapComponent && this.mapComponent.focusOnTrain) {
          this.mapComponent.focusOnTrain(trainId);
        }
      });

      // Add to DOM
      statusList.appendChild(item);
    });

    // Remove any trains that no longer exist
    existingTrainIds.forEach((id) => {
      const item = statusList.querySelector(`[data-train-id="${id}"]`);
      if (item) item.remove();
    });
  }
}
