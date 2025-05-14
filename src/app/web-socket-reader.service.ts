import { Injectable, OnDestroy } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { parse } from 'path';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocationData {
  id?: string; // Train ID
  name?: string; // Train name
  lat: number;
  lon: number;
  color?: string; // Optional color for the train marker
  departurePlace?: string; // Departure station/location
  destinationPlace?: string; // Destination station/location
  speedFactor?: number; // Speed factor for train movement
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketReaderService implements OnDestroy {
  private client: Client;
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  private trainsSubject = new BehaviorSubject<Map<string, LocationData>>(
    new Map()
  );
  private trains = new Map<string, LocationData>();
  constructor() {
    const wsUrl = 'ws://localhost:5001/ws/websocket';
    console.log('Initializing WebSocket service with URL:', wsUrl);

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP Debug: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.subscribeToLocationTopic();
      },
      onStompError: (frame) => {
        console.error('Broker reported error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
        // Try to reconnect
        setTimeout(() => this.reconnect(), 3000);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket connection error:', event);
        // Try to reconnect
        setTimeout(() => this.reconnect(), 3000);
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        // Try to reconnect only if it wasn't an intentional disconnect
        if (!this.intentionalDisconnect) {
          setTimeout(() => this.reconnect(), 3000);
        }
      },
    });

    this.initializeConnection();
  }
  ngOnDestroy(): void {
    // Properly disconnect from WebSocket
    this.disconnect();

    // Complete all subjects to prevent memory leaks
    this.locationSubject.complete();
    this.trainsSubject.complete();

    console.log('WebSocketReaderService destroyed');
  }

  private intentionalDisconnect = false;

  private reconnect() {
    console.log('Attempting to reconnect to WebSocket...');
    this.intentionalDisconnect = false;
    if (!this.client.active) {
      this.initializeConnection();
    }
  }
  private initializeConnection() {
    try {
      console.log('Initializing WebSocket connection...');

      // If client is already active, don't activate again
      if (this.client.active) {
        console.log('WebSocket client is already active');
        return;
      }

      this.client.activate();
    } catch (error) {
      console.error('Failed to activate WebSocket client:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => this.initializeConnection(), 5000);
    }
  }

  private subscribeToLocationTopic() {
    // Subscribe to individual location updates
    this.client.subscribe('/topic/location', (message) => {
      try {
        const locationData = JSON.parse(message.body);
        console.log('Received location:', locationData);

        // Update the single location subject for backward compatibility
        this.locationSubject.next(locationData);

        // Update trains map if we have an ID
        if (locationData.id) {
          this.updateTrainLocation(locationData);
        }
      } catch (error) {
        console.error('Error parsing location message:', error);
      }
    });

    // Subscribe to multi-train location updates
    this.client.subscribe('/topic/trains', (message) => {
      try {
        const trainsData = JSON.parse(message.body);
        console.log('Received trains data:', trainsData);

        // Update each train in the collection
        if (Array.isArray(trainsData)) {
          trainsData.forEach((train) => {
            if (train.id) {
              this.updateTrainLocation(train);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing trains message:', error);
      }
    });
  }

  private updateTrainLocation(train: LocationData) {
    if (!train.id) return;

    this.trains.set(train.id, train);
    this.trainsSubject.next(new Map(this.trains));
  }

  public sendLocation(location: LocationData) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/locate',
        body: JSON.stringify(location),
      });
    } else {
      console.warn('WebSocket not connected. Attempting to reconnect...');
      this.initializeConnection();
    }
  }

  public getLocationUpdates(): Observable<LocationData | null> {
    return this.locationSubject.asObservable();
  }

  public getTrainsUpdates(): Observable<Map<string, LocationData>> {
    return this.trainsSubject.asObservable();
  }
  public requestTrainsUpdate() {
    // First check if connection is available
    if (this.client && this.client.connected) {
      try {
        this.client.publish({
          destination: '/app/get-all-trains',
          body: JSON.stringify({ action: 'refresh' }),
        });
        console.log('Requested train updates from server');
      } catch (error) {
        console.error('Error requesting train updates:', error);
        this.handleConnectionError();
      }
    } else {
      console.warn('WebSocket not connected. Attempting to reconnect...');
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    if (!this.reconnectingInProgress) {
      this.reconnectingInProgress = true;
      console.log('Reconnecting to WebSocket server...');
      this.initializeConnection();

      // Reset the reconnecting flag after a delay
      setTimeout(() => {
        this.reconnectingInProgress = false;
      }, 5000);
    }
  }

  private reconnectingInProgress = false;
  public disconnect() {
    if (this.client) {
      console.log('Intentionally disconnecting from WebSocket server');
      this.intentionalDisconnect = true;
      this.client.deactivate();
    }
  }
}
