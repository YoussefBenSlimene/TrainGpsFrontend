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
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  trainMarker: Marker | undefined;
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
    const initialState = { lng: -122.4194, lat: 37.7749, zoom: 10 }; // San Francisco coordinates

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

    const el = document.createElement('img');
    el.src = './train.png';
    el.style.width = '40px';
    el.style.height = '40px';

    this.trainMarker = new maplibregl.Marker({ element: el })
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map)
      .setPopup(new maplibregl.Popup().setHTML('<h1>Train</h1>'));

    this.map.addControl(new maplibregl.NavigationControl());
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
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    this.webSocketReaderService.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  sendTestLocation() {
    const testLocation = { lat: 37.7749, lon: -122.4194 };
    this.webSocketReaderService.sendLocation(testLocation);
  }
}
