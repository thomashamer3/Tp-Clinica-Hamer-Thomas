import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { MatCard } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-seleccionar',
  standalone: true,
  imports: [MatCard, MatProgressSpinner, NgIf, NgFor],
  templateUrl: './seleccionar.component.html',
  styleUrl: './seleccionar.component.css',
})
export class SeleccionarComponent {
  especialidades: any;
  especialistas: any;
  pacientes: any;
  especialidadesFiltradas: any;
  especialidadSeleccionada: any;
  especialistaSeleccionado: any;
  cargando: boolean = false;
  indice = 0;
  usuario: any;

  constructor(
    private firestore: FirestoreService,
    public dialogRef: MatDialogRef<SeleccionarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: FirebaseAuthService
  ) {}

  async ngOnInit() {
    this.cargando = true;
    this.especialidades = await this.firestore.obtener('especialidades');
    let usuarios = await this.firestore.obtener('usuarios');
    this.especialistas = usuarios.filter(
      (element: any) => element.data.perfil === 'Especialista'
    );
    this.pacientes = usuarios.filter(
      (element: any) => element.data.perfil === 'Paciente'
    );
    this.usuario = await this.auth.getUsuarioLogueado();
    this.cargando = false;
  }

  seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.especialidadesFiltradas = this.especialidades.filter((element: any) =>
      especialista.data.datos.especialidades.includes(element.data.nombre)
    );

    if (this.especialidadesFiltradas.length === 0) {
      Swal.fire('', 'Este Doctor no tiene especialidades', 'info');
      this.dialogRef.close({});
    } else {
      this.indice = 1;
    }
  }

  seleccionarEspecialidad(especialidad: any) {
    this.especialidadSeleccionada = especialidad;

    if (this.usuario.data.perfil === 'Administrador') {
      this.indice = 2;
    } else {
      this.dialogRef.close({
        especialista: this.especialistaSeleccionado,
        especialidad: especialidad,
      });
    }
  }

  seleccionarPaciente(paciente: any) {
    this.dialogRef.close({
      especialista: this.especialistaSeleccionado,
      especialidad: this.especialidadSeleccionada,
      paciente: paciente,
    });
  }
}
