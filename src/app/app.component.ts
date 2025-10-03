import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/ui/sidebar/sidebar.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastContainerComponent],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      <main class="content">
        <router-outlet />
      </main>
    </div>
    <footer class="footer">
      <small
        >© {{ year }} Tools4Dev • Feito com ❤️ por
        <a href="https://github.com/wmsalves" target="_blank">wmsalves</a></small
      >
    </footer>

    <toast-container />
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  year = new Date().getFullYear();
}
