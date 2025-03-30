import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h2>Settings</h2>
      <div class="setting-item">
        <h3>Map Preferences</h3>
        <div class="setting-option">
          <label for="map-type">Map Type</label>
          <select id="map-type">
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div class="setting-item">
        <h3>Notification Preferences</h3>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked /> Enable notifications
          </label>
        </div>
      </div>

      <div class="setting-item">
        <h3>Location Settings</h3>
        <div class="setting-option">
          <label> <input type="checkbox" checked /> Use high accuracy </label>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        padding: 1rem;
        height: 100%;
      }
      h2 {
        color: #1976d2;
        margin-bottom: 1.5rem;
      }
      .setting-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;
      }
      h3 {
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
        color: #333;
      }
      .setting-option {
        margin-bottom: 0.5rem;
        display: flex;
        flex-direction: column;
      }
      label {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ccc;
        width: 100%;
        max-width: 300px;
      }
    `,
  ],
})
export class SettingsComponent {}
