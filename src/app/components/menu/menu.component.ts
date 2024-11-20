import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { SeccionUsuariosComponent } from '../seccion-usuarios/seccion-usuarios.component';
import { MatIconModule } from '@angular/material/icon';
import { MiPerfilComponent } from '../mi-perfil/mi-perfil.component';
import { SolicitarTurnoComponent } from '../solicitar-turno/solicitar-turno.component';
import { TurnosComponent } from '../turnos/turnos.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HistoriaClinicaFormComponent } from '../historia-clinica-form/historia-clinica-form.component';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, SeccionUsuariosComponent, MatIconModule, MiPerfilComponent, SolicitarTurnoComponent, TurnosComponent, HistoriaClinicaFormComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  animations: [
    trigger('slideInLeft', [
      state('void', style({
        transform: 'translateX(-100%)',
      })),
      state('*', style({
        transform: 'translateX(0)',
      })),
      transition('void => *', animate('500ms ease-in-out')),
    ]),
  ],
})
export class MenuComponent {
  pestania: number = 1;
  perfilActual : string = "";
  usuario :any;
  cargando:boolean = false;

  constructor(private auth:FirebaseAuthService,private router:Router){

  }

  async ngOnInit(){
    this.cargando = true;
    let ls = localStorage.getItem("usuario");
    let credenciales = JSON.parse(ls ? ls : "{}");
    this.usuario = (await this.auth.obtetenerUsuarioLogueadoBase(credenciales.user.uid))
    this.perfilActual = this.usuario.data.perfil;
    this.cargando = false;
  }

  verSeccionUsuario(){
    this.pestania = 0;
  }

  verMiPerfil(){
    this.pestania = 1;
  }

  verSolicitarTurno(){
    this.pestania = 2;
  }

  verTurnos(event?:any){
    this.pestania = 3;
  }

  verPacientes(){
    this.pestania = 4;
  }

  salir(){
    this.auth.logout();
  }
}
