import { Injectable, OnDestroy } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocationData {
  id?: string;
  name?: string;
  lat: number;
  lon: number;
  color?: string;
  departurePlace?: string;
  destinationPlace?: string;
  speedFactor?: number;
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
  // Store stable train metadata that won't change with position updates
  private trainMetadata = new Map<
    string,
    Pick<LocationData, 'name' | 'color' | 'departurePlace' | 'destinationPlace'>
  >();
  private intentionalDisconnect = false;
  private reconnectingInProgress = false;

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

    const trainId = train.id.toString();

    // If this is the first time we're seeing this train, save its metadata
    if (!this.trainMetadata.has(trainId) && train.name) {
      this.trainMetadata.set(trainId, {
        name: train.name,
        color: train.color,
        departurePlace: train.departurePlace,
        destinationPlace: train.destinationPlace,
      });
      console.log(
        `Saved metadata for train ${trainId}:`,
        this.trainMetadata.get(trainId)
      );
    }

    // Create a new train object with stable metadata and updated position
    const updatedTrain: LocationData = {
      ...train,
      // Use stable metadata if available, or fall back to current values
      name: this.trainMetadata.get(trainId)?.name || train.name,
      color: this.trainMetadata.get(trainId)?.color || train.color,
      departurePlace:
        this.trainMetadata.get(trainId)?.departurePlace || train.departurePlace,
      destinationPlace:
        this.trainMetadata.get(trainId)?.destinationPlace ||
        train.destinationPlace,
    };

    // Update the train in the map
    this.trains.set(trainId, updatedTrain);

    // Notify subscribers with a new copy of the map
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

  public disconnect() {
    if (this.client) {
      console.log('Intentionally disconnecting from WebSocket server');
      this.intentionalDisconnect = true;
      this.client.deactivate();
    }
  }
}
