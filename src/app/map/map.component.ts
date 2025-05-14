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
import { Map, Marker, Popup, LngLat } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import {
  WebSocketReaderService,
  LocationData,
} from '../web-socket-reader.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  trainMarkers: Record<string, Marker> = {}; // Map of train IDs to markers
  trainData: Record<string, LocationData> = {}; // Store train data for the sidebar
  activeTrainId: string | null = null;
  lastUpdateTime: Date = new Date();
  totalDistance: number = 0;
  mapRotation: number = 0;

  private locationSubscription: Subscription | null = null;
  private trainsSubscription: Subscription | null = null;
  private previousLocations: Record<string, { lat: number; lon: number }> = {};

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  // Default colors for trains if none provided
  private trainColors = ['#2196F3', '#FF5722', '#4CAF50', '#9C27B0', '#FFC107'];

  // Define different directions for each train based on ID
  private trainDirections: Record<string, { latDir: number; lonDir: number }> =
    {};

  constructor(
    public webSocketReaderService: WebSocketReaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Keep single location updates for backward compatibility
    this.locationSubscription = this.webSocketReaderService
      .getLocationUpdates()
      .subscribe((locationData) => {
        if (locationData) {
          console.log('Received legacy location data:', locationData);
          // Create a synthetic ID if none exists
          const trainId = locationData.id || 'default-train';
          this.updateTrainMarker(trainId, locationData);
          this.trainData[trainId] = locationData;
          this.updateDistanceAndTime(trainId, locationData);
        }
      });

    // Subscribe to multi-train updates
    this.trainsSubscription = this.webSocketReaderService
      .getTrainsUpdates()
      .subscribe((trains) => {
        if (trains.size > 0) {
          console.log('Updated trains collection:', trains);

          // Update all train markers
          trains.forEach((train, id) => {
            this.updateTrainMarker(id, train);
            this.trainData[id] = train;
            this.updateDistanceAndTime(id, train);
          });
        }
      });
  }

  updateDistanceAndTime(trainId: string, locationData: LocationData) {
    this.lastUpdateTime = new Date();

    // Calculate distance if we have previous coordinates
    if (this.previousLocations[trainId]) {
      const prev = this.previousLocations[trainId];
      const dist = this.calculateDistance(
        prev.lat,
        prev.lon,
        locationData.lat,
        locationData.lon
      );
      this.totalDistance += dist;
    }

    // Store current location for future distance calculations
    this.previousLocations[trainId] = {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get array of train IDs for the sidebar
  getTrainIds(): string[] {
    return Object.keys(this.trainData);
  }

  // Get color for a train
  getTrainColor(trainId: string): string {
    return this.trainData[trainId]?.color || this.getColorForTrain(trainId);
  }

  // Get name for a train
  getTrainName(trainId: string): string {
    return this.trainData[trainId]?.name || `Train ${trainId}`;
  }

  // Get train route information
  getTrainRoute(trainId: string): string {
    const train = this.trainData[trainId];
    if (train?.departurePlace && train?.destinationPlace) {
      return `${train.departurePlace} → ${train.destinationPlace}`;
    }
    return 'Route not available';
  }

  // Get formatted last update time
  getLastUpdateTime(): string {
    return this.lastUpdateTime.toLocaleTimeString();
  }

  // Get total distance rounded to 2 decimal places
  getTotalDistance(): string {
    return this.totalDistance.toFixed(2);
  }

  // Refresh trains data
  refreshTrains(): void {
    // Simulate refreshing by applying a small animation to the panels
    const selector = document.querySelector('.train-selector');
    if (selector) {
      selector.classList.add('refreshing');
      setTimeout(() => {
        selector.classList.remove('refreshing');
      }, 500);
    }

    // Try to get fresh data from the server
    this.webSocketReaderService.requestTrainsUpdate();
  }

  // Map control methods
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  rotateMap(): void {
    if (this.map) {
      this.mapRotation += 45;
      if (this.mapRotation >= 360) this.mapRotation = 0;
      this.map.setBearing(this.mapRotation);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private initMap() {
    const initialState = { lng: 10.1815, lat: 36.8065, zoom: 13 }; // Tunisia coordinates (default)

    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    this.map.addControl(new maplibregl.NavigationControl());
  }

  private createTrainMarker(id: string, trainData: LocationData): Marker {
    const el = document.createElement('div');
    el.className = 'train-marker';

    // Add train tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'train-tooltip';
    tooltip.textContent = trainData.name || `Train ${id}`;
    el.appendChild(tooltip);

    // Create a train icon
    const img = document.createElement('img');
    img.src = './train.png';
    img.style.width = '40px';
    img.style.height = '40px';

    // Add colored circle below the train
    const circle = document.createElement('div');
    circle.className = 'train-marker-circle';
    circle.style.backgroundColor = trainData.color || this.getColorForTrain(id);

    // Create train direction vector if it doesn't exist yet
    if (!this.trainDirections[id]) {
      // Create a unique direction based on train ID
      const hashValue = this.getHashFromId(id);
      const angle = (hashValue % 360) * (Math.PI / 180);
      this.trainDirections[id] = {
        latDir: Math.sin(angle),
        lonDir: Math.cos(angle),
      };
    }

    el.appendChild(circle);
    el.appendChild(img);

    // Create popup with train info
    const trainName = trainData.name || `Train ${id}`;
    const departurePlace = trainData.departurePlace || 'Unknown';
    const destinationPlace = trainData.destinationPlace || 'Unknown';

    const popup = new maplibregl.Popup({ offset: [0, -30] }).setHTML(`
      <div style="padding: 10px;">
        <h3 style="margin: 0 0 8px; color: #1976d2; font-size: 16px;">${trainName}</h3>
        <div style="font-size: 13px; margin-bottom: 5px;">
          <strong>Route:</strong> ${departurePlace} → ${destinationPlace}
        </div>
        <div style="font-size: 13px; margin-bottom: 5px;">
          <strong>Status:</strong> <span style="color: #4caf50;">In Transit</span>
        </div>
        <div style="font-size: 13px;">
          <strong>ID:</strong> ${id}
        </div>
      </div>
    `);

    // Create the marker and add click event
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([trainData.lon, trainData.lat])
      .setPopup(popup);

    // Add click event to center map on this train
    el.addEventListener('click', () => {
      this.focusOnTrain(id);
    });

    return marker;
  }

  private getHashFromId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private getColorForTrain(id: string): string {
    // Convert ID to a numeric hash and use it to pick a color
    let hash = this.getHashFromId(id);

    // Use hash to select from predefined colors
    const colorIndex = hash % this.trainColors.length;
    return this.trainColors[colorIndex];
  }

  private updateTrainMarker(id: string, trainData: LocationData) {
    if (!this.map) return;

    // Get existing marker or create a new one
    let marker = this.trainMarkers[id];

    if (!marker) {
      // Create new marker
      marker = this.createTrainMarker(id, trainData);
      marker.addTo(this.map);
      this.trainMarkers[id] = marker;
    } else {
      // Update existing marker with animation
      this.animateMarker(marker, trainData.lon, trainData.lat);
    }

    // If this is the active train or the first train, focus on it
    if (
      id === this.activeTrainId ||
      (!this.activeTrainId && Object.keys(this.trainMarkers).length === 1)
    ) {
      this.activeTrainId = id;
      this.map.flyTo({
        center: [trainData.lon, trainData.lat],
        zoom: 15,
        speed: 0.8,
      });
    }
  }

  private animateMarker(marker: Marker, newLon: number, newLat: number) {
    const start = marker.getLngLat();
    const end = { lng: newLon, lat: newLat };
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      const interpolatedLng = start.lng + (end.lng - start.lng) * t;
      const interpolatedLat = start.lat + (end.lat - start.lat) * t;

      marker.setLngLat([interpolatedLng, interpolatedLat]);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Focus map on a specific train
  public focusOnTrain(trainId: string) {
    const marker = this.trainMarkers[trainId];
    if (marker && this.map) {
      const lngLat = marker.getLngLat();

      this.map.flyTo({
        center: [lngLat.lng, lngLat.lat],
        zoom: 15,
        speed: 1.2,
      });

      // Show popup
      marker.togglePopup();

      // Set as active train
      this.activeTrainId = trainId;

      // Add active class to the marker element
      const markerElement = marker.getElement();
      Object.values(this.trainMarkers).forEach((m) =>
        m.getElement().classList.remove('active')
      );
      markerElement.classList.add('active');
    }
  }

  // Show all trains on map
  public showAllTrains() {
    if (!this.map || Object.keys(this.trainMarkers).length === 0) return;

    // Calculate bounds to include all trains
    const bounds = new maplibregl.LngLatBounds();

    Object.values(this.trainMarkers).forEach((marker) => {
      bounds.extend(marker.getLngLat());
    });

    // Pad the bounds to ensure all markers are visible
    this.map.fitBounds(bounds, {
      padding: 100,
      maxZoom: 14,
      duration: 1000,
    });

    this.activeTrainId = null;

    // Remove active class from all markers
    Object.values(this.trainMarkers).forEach((marker) => {
      marker.getElement().classList.remove('active');
    });
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.trainsSubscription) {
      this.trainsSubscription.unsubscribe();
    }
    this.webSocketReaderService.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  // Test method to simulate receiving different train locations
  sendTestTrains() {
    const testTrains = [
      {
        id: 'train1',
        name: 'Express Train',
        lat: 36.8065,
        lon: 10.1815,
        color: '#FF5722',
        departurePlace: 'Tunis',
        destinationPlace: 'Sousse',
      },
      {
        id: 'train2',
        name: 'Local Train',
        lat: 36.8165,
        lon: 10.1915,
        color: '#4CAF50',
        departurePlace: 'Bizerte',
        destinationPlace: 'Tunis',
      },
      {
        id: 'train3',
        name: 'Cargo Train',
        lat: 36.7965,
        lon: 10.1715,
        color: '#2196F3',
        departurePlace: 'Sfax',
        destinationPlace: 'Tunis',
      },
    ];

    // Send test trains one by one with a small delay
    testTrains.forEach((train, index) => {
      setTimeout(() => {
        this.webSocketReaderService.sendLocation(train);
      }, index * 500);
    });
  }
}
