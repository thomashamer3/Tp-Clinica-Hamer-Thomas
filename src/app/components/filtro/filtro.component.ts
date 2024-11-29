import { Component, Inject, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatTableDataSource,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import { DatosPerfilComponent } from '../datos-perfil/datos-perfil.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { HistoriaClinicaComponent } from '../historia-clinica/historia-clinica.component';
import {
  MatProgressSpinner,
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';
import { FechasPipe } from '../../pipes/fechas.pipe';

@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardTitle,
    MatTableModule,
    MatIcon,
    CommonModule,
    MatProgressSpinner,
    FechasPipe,
    HistoriaClinicaComponent,
  ],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.css',
})
export class FiltroComponent {
  form!: FormGroup;
  formPaciente!: FormGroup;
  formEspecialista!: FormGroup;
  formFecha!: FormGroup;
  formEstado!: FormGroup;
  formHorario!: FormGroup;

  tableEspecialidades: string[] = ['especialidad', 'check'];
  listaEspecialidades: MatTableDataSource<any> = new MatTableDataSource<any>();
  especialidades: any[] = [];

  tablePacientes: string[] = ['paciente', 'check'];
  listaPacientes: MatTableDataSource<any> = new MatTableDataSource<any>();
  pacientes: any[] = [];

  tableEspecialistas: string[] = ['especialista', 'check'];
  listaEspecialistas: MatTableDataSource<any> = new MatTableDataSource<any>();
  especialistas: any[] = [];

  tableFechas: string[] = ['fecha', 'check'];
  listaFechas: MatTableDataSource<any> = new MatTableDataSource<any>();
  fechas: any[] = [];

  tableEstados: string[] = ['estado', 'check'];
  listaEstados: MatTableDataSource<any> = new MatTableDataSource<any>();
  estados: any[] = [];

  tableHorarios: string[] = ['horario', 'check'];
  listaHorarios: MatTableDataSource<any> = new MatTableDataSource<any>();
  horarios: any[] = [];

  esEspecialista: boolean = false;
  indice = -1;

  @ViewChild('historiaClinica') historiaClinica!: any;
  historiasClinicas: any;
  usuario: any;

  cargando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any = null,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FiltroComponent>,
    private firestore: FirestoreService,
    private authService: FirebaseAuthService
  ) {}

  async ngOnInit() {
    this.cargando = true;

    this.form = this.formBuilder.group({
      especialidad: ['', []],
    });

    this.formPaciente = this.formBuilder.group({
      paciente: ['', []],
    });

    this.formEspecialista = this.formBuilder.group({
      especialista: ['', []],
    });

    this.formFecha = this.formBuilder.group({
      fecha: ['', []],
    });

    this.formEstado = this.formBuilder.group({
      estado: ['', []],
    });

    this.formHorario = this.formBuilder.group({
      horario: ['', []],
    });

    this.historiasClinicas = await this.firestore.obtener('historiaClinica');
    this.usuario = await this.authService.getUsuarioLogueado();
    this.listaEspecialidades.data = this.especialidades;
    this.listaPacientes.data = this.pacientes;
    this.listaEspecialistas.data = this.especialistas;
    this.listaFechas.data = this.fechas;
    this.listaEstados.data = this.estados;
    this.listaHorarios.data = this.horarios;

    let turnos = this.data.turnos;
    let aux: any[] = [];
    let aux2: any[] = [];
    let aux3: any[] = [];
    let aux4: any[] = [];
    let aux5: any[] = [];

    turnos.forEach((turno: any) => {
      if (!aux.includes(turno.especialidadObj.nombre)) {
        aux.push(turno.especialidadObj.nombre);
        this.especialidades.push(turno.especialidadObj);
      }

      if (!aux3.includes(this.formatearFecha(turno.fecha))) {
        aux3.push(this.formatearFecha(turno.fecha));
        turno.fecha.estaMarcado = false;
        this.fechas.push(turno.fecha);
      }

      if (!aux4.includes(turno.horario)) {
        aux4.push(turno.horario);
        this.horarios.push({ horario: turno.horario, estaMarcado: false });
      }

      if (!aux5.includes(turno.estado)) {
        aux5.push(turno.estado);
        this.estados.push({ estado: turno.estado, estaMarcado: false });
      }

      if (this.data.usuario.data.perfil === 'Especialista') {
        this.esEspecialista = true;
        if (!aux2.includes(turno.pacienteObj.datos.apellido)) {
          aux2.push(turno.pacienteObj.datos.apellido);
          turno.pacienteObj.estaMarcado = false;
          this.pacientes.push(turno.pacienteObj);
        }
      } else {
        if (!aux2.includes(turno.especialistaObj.datos.apellido)) {
          aux2.push(turno.especialistaObj.datos.apellido);
          turno.especialistaObj.estaMarcado = false;
          this.especialistas.push(turno.especialistaObj);
        }
      }
    });

    this.indice = 0;
    this.cargando = false;
  }

  formatearFecha(fecha1: Date): string {
    return (
      fecha1.getDate().toString() +
      fecha1.getMonth().toString() +
      fecha1.getFullYear().toString()
    );
  }

  verPersona(turno: any) {
    const dialogRef = this.dialog.open(DatosPerfilComponent, {
      data: { datos: turno },
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: any) => {});
  }

  verEspecialidades() {
    this.indice = 0;
  }

  verPacientes() {
    this.indice = 1;
  }

  verEspecialistas() {
    this.indice = 2;
  }

  verFechas() {
    this.indice = 3;
  }

  verHorarios() {
    this.indice = 4;
  }

  verEstados() {
    this.indice = 5;
  }

  verHistoriaClinica() {
    this.indice = 6;
  }

  filtrarEspecialidades() {
    this.listaEspecialidades.data = this.especialidades.filter(
      (element: any) => {
        const nombreEspecialidad = element.nombre.toLowerCase();
        const filtro = this.form.value.especialidad?.toLowerCase();
        return nombreEspecialidad.includes(filtro);
      }
    );
  }

  filtrarEstados() {
    this.listaEstados.data = this.estados.filter((element: any) => {
      const estado = element.estado.toLowerCase();
      const filtro = this.formEstado.value.estado?.toLowerCase();
      return estado.includes(filtro);
    });
  }

  filtrarFecha() {
    const filtro = this.formFecha.value.fecha ? this.formFecha.value.fecha : '';

    this.listaFechas.data = this.fechas.filter((element: any) => {
      const fecha = new Date(element);
      const fechaFormateada = fecha.toISOString().split('T')[0];

      return fechaFormateada.includes(filtro);
    });
  }

  filtrarPacientes() {
    this.listaPacientes.data = this.pacientes.filter((element: any) => {
      const apellidoPaciente = element.datos.apellido.toLowerCase();
      const filtro = this.formPaciente.value.paciente?.toLowerCase();
      return apellidoPaciente.includes(filtro);
    });
  }

  filtrarEspecialista() {
    this.listaEspecialistas.data = this.especialistas.filter((element: any) => {
      const apellidoEspecialista = element.datos.apellido.toLowerCase();
      const filtro = this.formEspecialista.value.especialista?.toLowerCase();
      return apellidoEspecialista.includes(filtro);
    });
  }

  filtrarHorarios() {
    this.listaHorarios.data = this.horarios.filter((element: any) => {
      const horario = element.horario.toLowerCase();
      const filtro = this.formHorario.value.horario?.toLowerCase();
      return horario.includes(filtro);
    });
  }

  filtrar() {
    const historiaClinicaValores = this.historiaClinica?.form?.value;
    const seCargoValor = historiaClinicaValores
      ? Object.values(historiaClinicaValores).some((value) => value !== null)
      : false;

    if (!seCargoValor) {
      let especialidadesMarcadas = this.especialidades.filter(
        (especialidad: any) => especialidad.estaMarcado
      );
      let pacientesMarcados = this.pacientes.filter(
        (especialidad: any) => especialidad.estaMarcado
      );
      let especialistasMarcados = this.especialistas.filter(
        (especialista: any) => especialista.estaMarcado
      );
      let fechasMarcadas = this.fechas.filter(
        (fecha: any) => fecha.estaMarcado
      );
      let estadosMarcados = this.estados.filter(
        (estado: any) => estado.estaMarcado
      );
      let horariosMarcados = this.horarios.filter(
        (horario: any) => horario.estaMarcado
      );

      if (especialidadesMarcadas.length > 0) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return especialidadesMarcadas.some(
            (especialidad: any) => turno.especialidadObj.id === especialidad.id
          );
        });
      }

      if (pacientesMarcados.length > 0 && this.esEspecialista) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return pacientesMarcados.some(
            (paciente: any) => turno.pacienteObj.id === paciente.id
          );
        });
      }

      if (especialistasMarcados.length > 0 && !this.esEspecialista) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return especialistasMarcados.some(
            (especialista: any) => turno.especialistaObj.id === especialista.id
          );
        });
      }

      if (fechasMarcadas.length > 0) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return fechasMarcadas.some(
            (fecha: any) =>
              this.formatearFecha(turno.fecha) === this.formatearFecha(fecha)
          );
        });
      }

      if (estadosMarcados.length > 0) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return estadosMarcados.some(
            (estado: any) => turno.estado === estado.estado
          );
        });
      }

      if (horariosMarcados.length > 0) {
        this.data.turnos = this.data.turnos.filter((turno: any) => {
          return horariosMarcados.some(
            (horario: any) => turno.horario === horario.horario
          );
        });
      }
    } else {
      this.filtrarTurnosPorHistoriasClinicas(this.historiaClinica.form.value);
    }

    this.cerrar();
  }

  filtrarTurnosPorHistoriasClinicas(historiaClinica: any) {
    let filtrado: any[];

    if (this.usuario.data.perfil === 'Paciente') {
      filtrado = this.historiasClinicas.filter(
        (element: any) => element.data.paciente.id === this.usuario.id
      );
    } else {
      filtrado = this.historiasClinicas.filter(
        (element: any) => element.data.especialista.id === this.usuario.id
      );
    }

    if (historiaClinica.altura !== null) {
      filtrado = filtrado.filter(
        (element: any) => element.data.altura === historiaClinica.altura
      );
    }

    if (historiaClinica.peso !== null) {
      filtrado = filtrado.filter(
        (element: any) => element.data.peso === historiaClinica.peso
      );
    }

    if (historiaClinica.presion !== null) {
      filtrado = filtrado.filter(
        (element: any) => element.data.presion === historiaClinica.presion
      );
    }

    if (historiaClinica.temperatura !== null) {
      filtrado = filtrado.filter(
        (element: any) =>
          element.data.temperatura === historiaClinica.temperatura
      );
    }

    if (
      historiaClinica.claveUno !== null &&
      historiaClinica.valorUno !== null
    ) {
      filtrado = filtrado.filter((element: any) => {
        return (
          (element.data.claveUno === historiaClinica.claveUno &&
            element.data.valorUno === historiaClinica.valorUno) ||
          (element.data.claveDos === historiaClinica.claveUno &&
            element.data.valorDos === historiaClinica.valorUno) ||
          (element.data.claveTres === historiaClinica.claveUno &&
            element.data.valorTres === historiaClinica.valorUno)
        );
      });
    }

    let turnos: any[] = [];
    filtrado.forEach((element: any) => {
      element.data.turno.fecha = element.data.turno.fecha.toDate();
      turnos.push(element.data.turno);
    });

    this.data.turnos = this.data.turnos.filter((turno: any) => {
      return turnos.some((turnoFiltrado: any) => {
        return (
          this.formatearFecha(turno.fecha) ===
            this.formatearFecha(turnoFiltrado.fecha) &&
          turno.horario === turnoFiltrado.horario
        );
      });
    });
  }

  cerrar() {
    this.dialogRef.close(this.data.turnos);
  }
}
