import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { WebSocketReaderService } from './app/web-socket-reader.service';

bootstrapApplication(AppComponent, {
  providers: [WebSocketReaderService],
}).catch((err) => console.error(err));
