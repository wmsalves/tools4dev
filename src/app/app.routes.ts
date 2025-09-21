import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Tools4Dev • Home',
  },
  {
    path: 'qr-code',
    loadComponent: () => import('./pages/qr-code/qr-code.component').then((m) => m.QrCodeComponent),
    title: 'Tools4Dev • QR Code',
  },
  {
    path: 'url-shortener',
    loadComponent: () =>
      import('./pages/url-shortener/url-shortener.component').then((m) => m.UrlShortenerComponent),
    title: 'Tools4Dev • URL Shortener',
  },
  { path: '**', redirectTo: '' },
];
