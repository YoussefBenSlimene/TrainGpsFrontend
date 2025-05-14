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
import { Map, Marker, NavigationControl, GeolocateControl } from 'maplibre-gl';
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
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  trainMarker: Marker | undefined;
  fixedMarker: Marker | undefined;
  private locationSubscription: Subscription | null = null;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    public webSocketReaderService: WebSocketReaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.locationSubscription = this.webSocketReaderService
      .getLocationUpdates()
      .subscribe((locationData) => {
        if (locationData) {
          console.log('Received location data:', locationData);
          this.updateTrainMarker(locationData.lon, locationData.lat);
        }
      });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private initMap() {
    const initialState = { lng: 11.027361, lat: 35.521222, zoom: 14 };

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

    // Création du marqueur fixe (position spécifique)
    this.createFixedMarker();

    // Création du marqueur du train
    this.createTrainMarker();

    // Ajout des contrôles de navigation
    this.map.addControl(new maplibregl.NavigationControl());
    this.map.addControl(new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserLocation: true
    }));
  }

  private createFixedMarker() {
    if (!this.map) return;

    const el = document.createElement('div');
    el.className = 'fixed-marker';
    el.style.fontSize = '24px';
    el.style.textShadow = '0 0 3px white';

    this.fixedMarker = new maplibregl.Marker({
      element: el,
      anchor: 'bottom'
    })
    .setLngLat([11.027361, 35.521222]) // 35°31'16.4"N 11°01'38.5"E
    .addTo(this.map)
    .setPopup(new maplibregl.Popup().setHTML(`
      <h3>Position de référence</h3>
      <p>35°31'16.4"N 11°01'38.5"E</p>
      <p>Coordonnées décimales:<br>
      Lat: 35.521222<br>
      Lng: 11.027361</p>
    `));
  }

  private createTrainMarker() {
    if (!this.map) return;

    const el = document.createElement('img');
    el.src = 'train.png'; 
    el.style.width = '40px';
    el.style.height = '40px';

    this.trainMarker = new maplibregl.Marker({ element: el })
      .setLngLat([11.027361, 35.521222]) // Position initiale identique au marqueur fixe
      .addTo(this.map)
      .setPopup(new maplibregl.Popup().setHTML('<h3>Position du train</h3>'));
  }

  // Méthodes pour les boutons de contrôle
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
            essential: true
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location');
        }
      );
    }
  }

  private updateTrainMarker(lon: number, lat: number) {
    if (this.trainMarker && this.map) {
      const start = this.trainMarker.getLngLat();
      const end = { lng: lon, lat: lat };
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1);

        const interpolatedLng = start.lng + (end.lng - start.lng) * t;
        const interpolatedLat = start.lat + (end.lat - start.lat) * t;

        this.trainMarker?.setLngLat([interpolatedLng, interpolatedLat]);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }

  ngOnDestroy() {
    this.locationSubscription?.unsubscribe();
    this.webSocketReaderService.disconnect();
    this.map?.remove();
  }
}