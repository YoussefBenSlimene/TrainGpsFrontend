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
import {
  Map as MaplibreMap,
  Marker,
  NavigationControl,
  GeolocateControl,
  Popup,
  LngLatLike,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import {
  WebSocketReaderService,
  LocationData,
} from '../web-socket-reader.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

interface TrainPath {
  type: 'LineString';
  coordinates: number[][];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: MaplibreMap | undefined;
  private fixedMarker: Marker | undefined;
  private trainsSubscription: Subscription | null = null;
  private trainMarkers: Record<string, Marker> = {};
  private trainPaths: Record<string, TrainPath> = {};
  trainsList: LocationData[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    public webSocketReaderService: WebSocketReaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.trainsSubscription = this.webSocketReaderService
      .getTrainsUpdates()
      .subscribe((trains) => {
        if (trains && trains.size > 0) {
          console.log('Received trains data, count:', trains.size);
          this.updateTrains(trains);
        }
      });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private initMap() {
    // Initial map center (Tunisia)
    const initialState = { lng: 10.204646, lat: 36.822229, zoom: 14 };

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

    // Add navigation controls
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: true,
      })
    );

    // Request initial train data after map loads
    this.map.on('load', () => {
      this.refreshTrains();
    });
  }

  // Update all trains on the map
  private updateTrains(trains: Map<string, LocationData>) {
    // Convert the Map to an array for the menu and sort by ID for consistent ordering
    const trainValues = Array.from(trains.values());
    trainValues.sort((a, b) => {
      const idA = a.id ? parseInt(a.id.toString()) : 0;
      const idB = b.id ? parseInt(b.id.toString()) : 0;
      return idA - idB;
    });

    // Check if the trainsList has actually changed before updating
    const hasChanged = this.trainListHasChanged(trainValues);
    if (hasChanged) {
      this.trainsList = trainValues;
    }

    // Update or create markers for each train
    trains.forEach((train: LocationData, id: string) => {
      if (!train.lat || !train.lon) return;

      // Create or update the train's path
      this.updateTrainPath(train);

      // Create or update the train's marker
      if (id in this.trainMarkers) {
        this.updateTrainMarker(id, train);
      } else {
        this.createTrainMarker(id, train);
      }
    });
  }

  // Check if the trains list has actually changed to prevent unnecessary UI updates
  private trainListHasChanged(newTrains: LocationData[]): boolean {
    if (this.trainsList.length !== newTrains.length) {
      return true;
    }

    for (let i = 0; i < newTrains.length; i++) {
      const oldTrain = this.trainsList[i];
      const newTrain = newTrains[i];

      if (!oldTrain || !newTrain || oldTrain.id !== newTrain.id) {
        return true;
      }

      // Only compare important properties that affect UI display
      if (
        oldTrain.name !== newTrain.name ||
        oldTrain.departurePlace !== newTrain.departurePlace ||
        oldTrain.destinationPlace !== newTrain.destinationPlace ||
        oldTrain.color !== newTrain.color
      ) {
        return true;
      }
    }

    return false;
  }

  // Create a new train marker
  private createTrainMarker(id: string, train: LocationData) {
    if (!this.map) return;

    // Create train icon element
    const el = document.createElement('div');
    el.className = 'train-marker';
    el.style.backgroundColor = train.color || '#FF5733';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

    // Create popup with train info
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: ${train.color || '#FF5733'};">${
      train.name || 'Train ' + id
    }</h3>
        <p style="margin: 0; font-size: 12px;">
          <b>From:</b> ${train.departurePlace || 'Unknown'}<br>
          <b>To:</b> ${train.destinationPlace || 'Unknown'}<br>
          <b>ID:</b> ${id}
        </p>
      </div>
    `);

    // Create and save the marker
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([train.lon, train.lat])
      .setPopup(popup)
      .addTo(this.map);

    this.trainMarkers[id] = marker;
  }

  // Update an existing train marker with animation
  private updateTrainMarker(id: string, train: LocationData) {
    const marker = this.trainMarkers[id];
    if (!marker || !this.map) return;

    // Only update position if the location has actually changed
    const currentPos = marker.getLngLat();
    if (currentPos.lng === train.lon && currentPos.lat === train.lat) {
      return;
    }

    const start = currentPos;
    const end = { lng: train.lon, lat: train.lat };
    const duration = 1000;
    const startTime = performance.now();

    // Update popup content without recreating it
    const popup = marker.getPopup();
    if (popup) {
      popup.setHTML(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: ${train.color || '#FF5733'};">${
        train.name || 'Train ' + id
      }</h3>
          <p style="margin: 0; font-size: 12px;">
            <b>From:</b> ${train.departurePlace || 'Unknown'}<br>
            <b>To:</b> ${train.destinationPlace || 'Unknown'}<br>
            <b>ID:</b> ${id}
          </p>
        </div>
      `);
    }

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

  // Update or create a path for a train
  private updateTrainPath(train: LocationData) {
    if (!this.map || !train.id) return;

    const id = train.id.toString();
    const sourceId = `route-${id}`;
    const layerId = `route-layer-${id}`;

    // If this is the first point for this train, create a new path
    if (!(id in this.trainPaths)) {
      this.trainPaths[id] = {
        type: 'LineString',
        coordinates: [[train.lon, train.lat]],
      };

      // Add the source if it doesn't exist
      if (!this.map.getSource(sourceId)) {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: this.trainPaths[id],
          },
        });

        // Add the layer
        this.map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': train.color || '#FF5733',
            'line-width': 3,
            'line-opacity': 0.7,
          },
        });
      }
    } else {
      // Update existing path by adding new point
      const path = this.trainPaths[id];

      // Add the new coordinate to the path
      path.coordinates.push([train.lon, train.lat]);

      // Keep only the last 50 points to avoid performance issues
      if (path.coordinates.length > 50) {
        path.coordinates = path.coordinates.slice(-50);
      }

      // Update the source data
      if (this.map.getSource(sourceId)) {
        (this.map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: path,
        });
      }
    }
  }

  // Methods for UI controls
  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  locateUser(): void {
    if (this.map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.map?.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15,
            essential: true,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location');
        }
      );
    }
  }

  // Refresh train data from the server
  refreshTrains(): void {
    console.log('Requesting train updates');
    this.webSocketReaderService.requestTrainsUpdate();
  }

  // Center the map on a specific train
  centerOnTrain(trainId: string | undefined): void {
    if (!trainId || !this.map) return;

    const marker = this.trainMarkers[trainId];
    if (marker) {
      const position = marker.getLngLat();
      this.map.flyTo({
        center: position,
        zoom: 15,
        essential: true,
      });
      marker.togglePopup();
    }
  }

  ngOnDestroy() {
    this.trainsSubscription?.unsubscribe();
    this.webSocketReaderService.disconnect();
    this.map?.remove();
  }
}
