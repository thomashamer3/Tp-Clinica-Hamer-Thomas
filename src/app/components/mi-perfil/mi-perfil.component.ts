import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidatorFn,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import {
  MatProgressSpinner,
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CommonModule, NgIf } from '@angular/common';
import { DatosPerfilComponent } from '../datos-perfil/datos-perfil.component';
import { HistoriaClinicaFormComponent } from '../historia-clinica-form/historia-clinica-form.component';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    NgIf,
    DatosPerfilComponent,
    CommonModule,
    HistoriaClinicaFormComponent,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent {
  usuario: any;
  especialidades: any;
  cargando: boolean = false;
  tieneHorarios: boolean = false;
  horarios: any[] = [];
  form!: FormGroup;
  constructor(
    private auth: FirebaseAuthService,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
  }

  horarioValido(dia?: string): ValidatorFn {
    return (control: AbstractControl): {} | null => {
      const value = control.value;
      if (value < '08:00' || value > '19:00') {
        return { timeRange: true };
      } else if (dia === 'sabado' && (value < '08:00' || value > '14:00')) {
        return { timeRange: true };
      } else {
        return null;
      }
    };
  }

  async ngOnInit() {
    await this.auth.getUsuarioLogueado().then((resultado) => {
      this.usuario = resultado;
    });

    if (this.usuario.data.perfil === 'Especialista') {
      this.especialidades = JSON.parse(this.usuario.data.datos.especialidades);
      this.form.get('lunesEspecialidad')?.setValue(this.especialidades[0]);
      this.form.get('martesEspecialidad')?.setValue(this.especialidades[0]);
      this.form.get('miercolesEspecialidad')?.setValue(this.especialidades[0]);
      this.form.get('juevesEspecialidad')?.setValue(this.especialidades[0]);
      this.form.get('viernesEspecialidad')?.setValue(this.especialidades[0]);
      this.form.get('sabadoEspecialidad')?.setValue(this.especialidades[0]);
      await this.actualizar();
    }

    this.form = this.formBuilder.group({
      lunes: [false], // Para el checkbox de lunes
      lunesDesde: ['08:00', [Validators.required, this.horarioValido()]], // Para la hora de inicio del lunes
      lunesHasta: ['19:00', [Validators.required, this.horarioValido()]], // Para la hora de fin del lunes
      lunesEspecialidad: ['', [Validators.required]],
      duracionTurnoLunes: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
      martes: [false], // Para el checkbox de lunes
      martesDesde: ['08:00', [Validators.required, this.horarioValido()]], // Para la hora de inicio del lunes
      martesHasta: ['19:00', [Validators.required, this.horarioValido()]], // Para la hora de fin del lunes
      martesEspecialidad: ['', [Validators.required]],
      duracionTurnoMartes: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
      miercoles: [false], // Para el checkbox de lunes
      miercolesDesde: ['08:00', [Validators.required, this.horarioValido()]], // Para la hora de inicio del lunes
      miercolesHasta: ['19:00', [Validators.required, this.horarioValido()]], // Para la hora de fin del lunes
      miercolesEspecialidad: ['', [Validators.required]],
      duracionTurnoMiercoles: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
      jueves: [false], // Para el checkbox de lunes
      juevesDesde: ['08:00', [Validators.required, this.horarioValido()]], // Para la hora de inicio del lunes
      juevesHasta: ['19:00', [Validators.required, this.horarioValido()]], // Para la hora de fin del lunes
      juevesEspecialidad: ['', [Validators.required]],
      duracionTurnoJueves: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
      viernes: [false], // Para el checkbox de lunes
      viernesDesde: ['08:00', [Validators.required, this.horarioValido()]], // Para la hora de inicio del lunes
      viernesHasta: ['19:00', [Validators.required, this.horarioValido()]], // Para la hora de fin del lunes
      viernesEspecialidad: ['', [Validators.required]],
      duracionTurnoViernes: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
      sabado: [false], // Para el checkbox de lunes
      sabadoDesde: [
        '08:00',
        [Validators.required, this.horarioValido('sabado')],
      ], // Para la hora de inicio del lunes
      sabadoHasta: [
        '14:00',
        [Validators.required, this.horarioValido('sabado')],
      ], // Para la hora de fin del lunes
      sabadoEspecialidad: ['', [Validators.required]],
      duracionTurnoSabado: [
        30,
        [Validators.required, Validators.min(30), Validators.max(60)],
      ],
    });
  }

  async actualizar() {
    this.horarios = await this.firestore.obtener('horarios');
    this.horarios = this.horarios.filter(
      (element: any) => element.data.especialista.id === this.usuario.id
    );
    if (this.horarios.length) {
      //console.log(this.horarios[0])
      this.tieneHorarios = true;
      this.form = this.formBuilder.group({
        lunes: [this.horarios[0].data.horarios.lunes], // Para el checkbox de lunes
        lunesDesde: [
          this.horarios[0].data.horarios.lunesDesde,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de inicio del lunes
        lunesHasta: [
          this.horarios[0].data.horarios.lunesHasta,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de fin del lunes
        lunesEspecialidad: [
          this.horarios[0].data.horarios.lunesEspecialidad,
          [Validators.required],
        ],
        duracionTurnoLunes: [
          this.horarios[0].data.horarios.duracionTurnoLunes,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
        martes: [this.horarios[0].data.horarios.martes], // Para el checkbox de lunes
        martesDesde: [
          this.horarios[0].data.horarios.martesDesde,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de inicio del lunes
        martesHasta: [
          this.horarios[0].data.horarios.martesHasta,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de fin del lunes
        martesEspecialidad: [
          this.horarios[0].data.horarios.martesEspecialidad,
          [Validators.required],
        ],
        duracionTurnoMartes: [
          this.horarios[0].data.horarios.duracionTurnoMartes,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
        miercoles: [this.horarios[0].data.horarios.miercoles], // Para el checkbox de lunes
        miercolesDesde: [
          this.horarios[0].data.horarios.miercolesDesde,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de inicio del lunes
        miercolesHasta: [
          this.horarios[0].data.horarios.miercolesHasta,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de fin del lunes
        miercolesEspecialidad: [
          this.horarios[0].data.horarios.miercolesEspecialidad,
          [Validators.required],
        ],
        duracionTurnoMiercoles: [
          this.horarios[0].data.horarios.duracionTurnoMiercoles,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
        jueves: [this.horarios[0].data.horarios.jueves], // Para el checkbox de lunes
        juevesDesde: [
          this.horarios[0].data.horarios.juevesDesde,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de inicio del lunes
        juevesHasta: [
          this.horarios[0].data.horarios.juevesHasta,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de fin del lunes
        juevesEspecialidad: [
          this.horarios[0].data.horarios.juevesEspecialidad,
          [Validators.required],
        ],
        duracionTurnoJueves: [
          this.horarios[0].data.horarios.duracionTurnoJueves,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
        viernes: [this.horarios[0].data.horarios.viernes], // Para el checkbox de lunes
        viernesDesde: [
          this.horarios[0].data.horarios.viernesDesde,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de inicio del lunes
        viernesHasta: [
          this.horarios[0].data.horarios.viernesHasta,
          [Validators.required, this.horarioValido()],
        ], // Para la hora de fin del lunes
        viernesEspecialidad: [
          this.horarios[0].data.horarios.viernesEspecialidad,
          [Validators.required],
        ],
        duracionTurnoViernes: [
          this.horarios[0].data.horarios.duracionTurnoViernes,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
        sabado: [this.horarios[0].data.horarios.sabado], // Para el checkbox de lunes
        sabadoDesde: [
          this.horarios[0].data.horarios.sabadoDesde,
          [Validators.required, this.horarioValido('sabado')],
        ], // Para la hora de inicio del lunes
        sabadoHasta: [
          this.horarios[0].data.horarios.sabadoHasta,
          [Validators.required, this.horarioValido('sabado')],
        ], // Para la hora de fin del lunes
        sabadoEspecialidad: [
          this.horarios[0].data.horarios.sabadoEspecialidad,
          [Validators.required],
        ],
        duracionTurnoSabado: [
          this.horarios[0].data.horarios.duracionTurnoSabado,
          [Validators.required, Validators.min(30), Validators.max(60)],
        ],
      });
    }
  }

  public selectEspecialidad = function (option: any, value: any): boolean {
    if (value == null) {
      return false;
    }

    return option === value;
  };

  getDiasSeleccionados() {
    const diasSeleccionados = [];
    const dias = [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];

    for (const dia of dias) {
      const checkboxControl = this.form.get(dia);

      if (checkboxControl?.value === true) {
        diasSeleccionados.push(dia);
      }
    }

    return diasSeleccionados;
  }

  calcularTurnos() {
    const diasSemana = [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];

    const turnosPorDia: any = [];

    for (const dia of diasSemana) {
      const checkboxControl = this.form.get(dia);
      const desdeControl = this.form.get(`${dia}Desde`);
      const hastaControl = this.form.get(`${dia}Hasta`);
      const especialidadControl = this.form.get(`${dia}Especialidad`);

      const duracionTurnoControl = this.form.get(
        `duracionTurno${dia.charAt(0).toUpperCase() + dia.slice(1)}`
      );

      if (
        checkboxControl?.value === true &&
        desdeControl?.value &&
        duracionTurnoControl?.value &&
        hastaControl?.value &&
        especialidadControl?.value
      ) {
        const horaInicio = new Date(`1970-01-01T${desdeControl.value}`);
        const duracionMinutos = duracionTurnoControl.value;

        const turnos = [];

        while (
          horaInicio.getTime() + duracionMinutos * 60 * 1000 <=
          new Date(`1970-01-01T${hastaControl.value}`).getTime()
        ) {
          let hasta = new Date(
            horaInicio.getTime() + duracionMinutos * 60 * 1000
          );
          turnos.push({
            disponible: true,
            horario:
              horaInicio.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) +
              '-' +
              hasta.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
          });
          horaInicio.setTime(
            horaInicio.getTime() + duracionMinutos * 60 * 1000
          );
        }

        turnosPorDia.push({
          dia: dia,
          especialidad: especialidadControl.value,
          horas: turnos,
        });
      }
    }

    return turnosPorDia;
  }

  async guardarTurnos() {
    //console.log(this.getDiasSeleccionados())
    //console.log(this.calcularTurnos())
    let turnosCargados = await this.firestore.obtener('turnos');
    turnosCargados = turnosCargados.filter((turno: any) => {
      console.log(turno); //data.dia[0].hora[0].estado
      turno.data.dia = turno.data.dia.filter((dia: any) => {
        dia.hora = dia.hora.filter((hora: any) => {
          return hora.estado === 'Pendiente';
        });
        return dia.hora.length !== 0;
      });
      return turno.data.dia.length !== 0;
    });

    if (turnosCargados.length === 0) {
      if (this.form.valid) {
        if (!this.tieneHorarios) {
          let data = {
            especialista: this.usuario,
            horarios: this.form.value,
            horariosCalculados: this.calcularTurnos(),
          };
          //console.log(data)
          this.cargando = true;
          await this.firestore.guardar(data, 'horarios');
          this.cargando = false;
        } else {
          let data = {
            id: this.horarios[0].id,
            data: {
              especialista: this.usuario,
              horarios: this.form.value,
              horariosCalculados: this.calcularTurnos(),
            },
          };
          //console.log(data)
          this.cargando = true;
          await this.firestore.modificar(data, 'horarios');
          this.cargando = false;
        }
        await this.actualizar();
        Swal.fire('OK', 'Horarios guardados de manera correcta', 'success');
      } else {
        Swal.fire('ERROR', 'Verifique todos los campos requeridos', 'error');
      }
    } else {
      Swal.fire(
        'ERROR',
        'Existen turnos pendientes en el horario anterior',
        'error'
      );
    }
  }
}
