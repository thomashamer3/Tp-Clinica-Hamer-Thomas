import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import Swal from 'sweetalert2';
import { FirestoreService } from '../services/firestore.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AutorizadoGuard implements CanActivate {
  private router = inject(Router);
  private firestore = inject(FirestoreService);
  private auth = inject(FirebaseAuthService);

  async guardarLog() {
    let data = {
      usuario: await this.auth.getUsuarioLogueado(),
      dia: new Date().getTime(),
    };
    this.firestore.guardar(data, 'logs');
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    let respuesta = false;
    const ls = localStorage.getItem('usuario');

    if (ls !== undefined && ls !== 'undefined' && ls !== null) {
      const credenciales = JSON.parse(ls ? ls : '');
      const usuario = await this.auth.obtetenerUsuarioLogueadoBase(
        credenciales.user.uid
      );

      respuesta = credenciales?.user?.emailVerified ? true : false;

      if (!respuesta) {
        Swal.fire(
          'ERROR',
          'Debes verificar el mail antes de ingresar',
          'error'
        );
      }

      if (respuesta && usuario.data.perfil === 'Especialista') {
        respuesta = usuario.data.cuentaAprobada ? true : false;
        if (!respuesta) {
          Swal.fire(
            'ERROR',
            'Su cuenta de especialista debe ser aprobada por un administrador',
            'error'
          );
        }
      }
    } else {
      Swal.fire('ERROR', 'Usuario no autorizado', 'error');
    }

    if (!respuesta) {
      localStorage.clear();
      this.router
        .navigateByUrl('/refresh', { skipLocationChange: true })
        .then(() => this.router.navigate(['login']));
    } else {
      await this.guardarLog();
    }

    return respuesta;
  }
}
