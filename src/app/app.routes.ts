import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Tools4Dev • Home',
  },
  {
    path: 'cpf-generator',
    loadComponent: () =>
      import('./pages/cpf-generator/cpf-generator.component').then((m) => m.CpfGeneratorComponent),
    title: 'Tools4Dev • CPF Generator',
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
  {
    path: 'uuid',
    loadComponent: () => import('./pages/uuid/uuid.component').then((m) => m.UuidComponent),
    title: 'Tools4Dev • UUID Generator',
  },
  {
    path: 'password',
    loadComponent: () =>
      import('./pages/password/password.component').then((m) => m.PasswordComponent),
    title: 'Tools4Dev • Password Generator',
  },
  {
    path: 'timestamp',
    loadComponent: () =>
      import('./pages/timestamp/timestamp.component').then((m) => m.TimestampComponent),
    title: 'Tools4Dev • Timestamp Converter',
  },
  {
    path: 'json-formatter',
    loadComponent: () =>
      import('./pages/json-formatter/json-formatter.component').then(
        (m) => m.JsonFormatterComponent
      ),
    title: 'Tools4Dev • JSON Formatter',
  },
  {
    path: 'jwt-decoder',
    loadComponent: () =>
      import('./pages/jwt-decoder/jwt-decoder.component').then((m) => m.JwtDecoderComponent),
    title: 'Tools4Dev • JWT Decoder',
  },
  {
    path: 'diff-checker',
    loadComponent: () =>
      import('./pages/diff-checker/diff-checker.component').then((m) => m.DiffCheckerComponent),
    title: 'Tools4Dev • Text Diff Checker',
  },
  {
    path: 'regex-tester',
    loadComponent: () =>
      import('./pages/regex-tester/regex-tester.component').then((m) => m.RegexTesterComponent),
    title: 'Tools4Dev • Regex Tester',
  },
  { path: '**', redirectTo: '' },
];
