import { Component, ElementRef, inject, Input, Optional } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { EspecialidadesComponent } from '../especialidades/especialidades.component';
import Swal from 'sweetalert2';
import {
  RecaptchaModule,
  RECAPTCHA_SETTINGS,
  RecaptchaSettings,
  RECAPTCHA_LANGUAGE,
} from 'ng-recaptcha';
import { FocusDirective } from '../../directivas/focus.directive';

@Component({
  selector: 'app-form-especialista',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatIconModule,
    RecaptchaModule,
    MatProgressSpinnerModule,
    FocusDirective,
  ],
  templateUrl: './form-especialista.component.html',
  styleUrl: './form-especialista.component.css',
})
export class FormEspecialistaComponent {
  imagenes: any;
  yaCargo: boolean = false;
  yaCargoEspecialidad: boolean = false;
  especialidadesSeleccionadas: any[] = [];
  @Input() mostrarVolver: boolean = false;
  flag: boolean = false;

  fb = inject(FormBuilder);
  authService = inject(FirebaseAuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);
  firestore = inject(FirestoreService);
  storage = inject(StorageService);
  dialog = inject(MatDialog);

  constructor(
    @Optional() public dialogRef: MatDialogRef<FormEspecialistaComponent>
  ) {}

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
    dni: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]{1,3}?[0-9]{3,3}?[0-9]{3,3}$'),
      ],
    ],
    mail: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
    especialidades: [''],
  });

  imagenCargada(event: any) {
    this.yaCargo = true;
    const input = event.target as HTMLInputElement;
    this.imagenes = input.files;
  }

  executeRecaptcha(token: any) {
    console.log(token);
    this.flag = true;
  }

  async enviar() {
    let formValido =
      this.form.valid &&
      (this.imagenes ? this.imagenes.length : 0) === 1 &&
      this.especialidadesSeleccionadas.length >= 1;
    if (formValido) {
      Swal.fire({
        title: 'Cargando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      let credenciales = await this.authService.register({
        email: this.form.value.mail,
        password: this.form.value.clave,
      });
      let fotos: string[] = [];

      for (let i = 0; i < this.imagenes.length; i++) {
        fotos.push(
          await this.storage.guardarFoto(this.imagenes[i], 'usuarios')
        );
      }

      this.form
        .get('especialidades')
        ?.setValue(
          JSON.stringify(
            this.especialidadesSeleccionadas.map((element) => element.nombre)
          )
        );

      let usuario = {
        datos: this.form.value,
        perfil: 'Especialista',
        cuentaAprobada: false,
        credenciales: JSON.stringify(credenciales),
        fotos: fotos,
      };
      await this.firestore.guardar(usuario, 'usuarios');
      this.form.reset();
      Swal.close();
      this.router.navigate(['login']);
    } else {
      Swal.fire('ERROR', 'Verifique los campos ingresados', 'error');
    }

    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  volver() {
    this.router.navigate(['bienvenida']);
  }

  seleccionarEspecialidades(): void {
    const dialogRef = this.dialog.open(EspecialidadesComponent, {
      data: { lista: this.especialidadesSeleccionadas },
      width: '1000px',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.especialidadesSeleccionadas = result;
      console.log(this.especialidadesSeleccionadas);
      let html = '<ul>';
      this.especialidadesSeleccionadas.forEach((especialidad) => {
        html += `<li>${especialidad.nombre}</li>`;
      });
      html += '</ul>';
      Swal.fire({
        title: 'Especialidades elegidas',
        html: html,
        icon: 'info',
      });
      this.yaCargoEspecialidad = true;
    });
  }
}