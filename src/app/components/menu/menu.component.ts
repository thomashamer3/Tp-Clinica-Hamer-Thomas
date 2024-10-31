import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { SeccionUsuariosComponent } from '../seccion-usuarios/seccion-usuarios.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, SeccionUsuariosComponent, MatIconModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  habilitarSeccionUsuarios: boolean = false;
  perfilActual: string = '';

  constructor(private auth: FirebaseAuthService, private router: Router) {}

  async ngOnInit() {
    let ls = localStorage.getItem('usuario');
    let credenciales = JSON.parse(ls ? ls : '{}');
    let usuario = await this.auth.obtetenerUsuarioLogueadoBase(
      credenciales.user.uid
    );
    if (usuario.data.perfil === 'Administrador') {
      this.perfilActual = 'Administrador';
      this.habilitarSeccionUsuarios = !this.habilitarSeccionUsuarios;
    }
  }

  /*verSeccionUsuario() {
    this.habilitarSeccionUsuarios = !this.habilitarSeccionUsuarios;
  }*/

  salir() {
    this.router.navigate(['bienvenida']);
    this.auth.logout();
  }
}
