import { Routes } from '@angular/router';
import { AutorizadoGuard } from './guards/autorizado.guard';

export const routes: Routes = [
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./components/bienvenida/bienvenida.component').then(
        (m) => m.BienvenidaComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro/registro.component').then(
        (m) => m.RegistroComponent
      ),
  },
  {
    path: 'registro-pacientes',
    loadComponent: () =>
      import(
        './components/registro-pacientes/registro-pacientes.component'
      ).then((m) => m.RegistroPacientesComponent),
  },
  {
    path: 'registro-especialistas',
    loadComponent: () =>
      import(
        './components/registro-especialistas/registro-especialistas.component'
      ).then((m) => m.RegistroEspecialistasComponent),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./components/menu/menu.component').then((m) => m.MenuComponent),
    canActivate: [AutorizadoGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/bienvenida/bienvenida.component').then(
        (m) => m.BienvenidaComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'bienvenida',
  },
];
