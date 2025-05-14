import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import your map component
import { MapComponent } from './map/map.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    component: MapComponent,
  },
  // Add a catch-all route
  {
    path: '**',
    redirectTo: 'map',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Enable for debugging
      enableTracing: false,
      // Restore scroll position
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
