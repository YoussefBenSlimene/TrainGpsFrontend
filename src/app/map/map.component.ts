import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { WebSocketReaderService } from '../web-socket-reader.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule], // Add any necessary imports here
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  trainMarker: Marker | undefined;
  private messageSubscription: Subscription | null = null;

  getMsg!: ElementRef<HTMLButtonElement>;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    private webSocketReaderService: WebSocketReaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    // Initial WebSocket connection
    this.webSocketReaderService.getMessages().subscribe({
      next: (message) => {
        console.log('Received message:', message);
      },
      error: (error) => console.error('WebSocket error:', error),
    });
    this.webSocketReaderService.sendMessage('Hello from Angular!');
  }

  private updateTrainLocation(message: any) {
    if (this.trainMarker && message.lat && message.lon) {
      this.trainMarker.setLngLat([message.lon, message.lat]);

      // Optional: Fly to the new location
      if (this.map) {
        this.map.flyTo({
          center: [message.lon, message.lat],
          zoom: 10,
        });
      }
    }
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      /*
      // Add click event listener to the button
      if (this.getMsg && this.getMsg.nativeElement) {
        this.getMsg.nativeElement.addEventListener('click', () => {
          this.requestMessage();
        });
      }*/
    }
  }
  /* private requestMessage() {
    // Request a new message from the server
    this.webSocketReaderService.requestMessage();

    // Optional: Create a temporary subscription to get the next message
    const tempSubscription = this.webSocketReaderService.connect().subscribe({
      next: (message) => {
        console.log('Manually requested message:', message);
        this.updateTrainLocation(message);
        // Unsubscribe after receiving the message
        tempSubscription.unsubscribe();
      },
      error: (error) => console.error('Message request error:', error),
    });
  }

  public getMessages() {
    this.webSocketReaderService.connect().subscribe({
      next: (message) => {
        console.log('Received message:', message);
        this.updateTrainLocation(message);
      },
      error: (error) => console.error('WebSocket error:', error),
    });
  }*/

  private initMap() {
    const initialState = { lng: 12.550343, lat: 55.665957, zoom: 8 };

    console.log('Initializing map:', this.mapContainer.nativeElement);

    try {
      this.map = new maplibregl.Map({
        container: this.mapContainer.nativeElement,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=QZKkB5NpxESycimzHn0F`,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom,
      });

      // Add a console log to confirm map creation
      console.log('Map created:', this.map);

      const el = document.createElement('img');
      el.src = './train.png';
      el.style.width = '40px';
      el.style.height = '40px';

      this.trainMarker = new maplibregl.Marker({ element: el })
        .setLngLat([initialState.lng, initialState.lat])
        .addTo(this.map);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
  ngOnDestroy() {
    // Clean up subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    // Remove map
    if (this.map) {
      this.map.remove();
    }
  }
}
