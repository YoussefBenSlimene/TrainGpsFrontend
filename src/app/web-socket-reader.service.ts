import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';

interface LocationData {
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketReaderService {
  private client: Client;
  private locationSubject = new BehaviorSubject<LocationData | null>(null);

  constructor() {
    const wsUrl = 'ws://localhost:5001/ws/websocket';

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
      },
      onWebSocketError: (event) => {
        console.error('WebSocket connection error:', event);
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
      },
    });

    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      this.client.activate();
    } catch (error) {
      console.error('Failed to activate WebSocket client:', error);
    }
  }

  private subscribeToLocationTopic() {
    this.client.subscribe('/topic/location', (message) => {
      try {
        const locationData = JSON.parse(message.body);
        console.log('Received location:', locationData);
        this.locationSubject.next(locationData);
      } catch (error) {
        console.error('Error parsing location message:', error);
      }
    });
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

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
