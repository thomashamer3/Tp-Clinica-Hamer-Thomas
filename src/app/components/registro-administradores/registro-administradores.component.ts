import { Component, Input, Optional } from '@angular/core';
import {
  FormBuilder,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import Swal from 'sweetalert2';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registro-administradores',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './registro-administradores.component.html',
  styleUrl: './registro-administradores.component.css',
})
export class RegistroAdministradoresComponent {
  form!: FormGroup;
  imagenes: any;
  yaCargo: boolean = false;
  @Input() mostrarVolver: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: FirebaseAuthService,
    private firestore: FirestoreService,
    private storage: StorageService,
    @Optional() public dialogRef: MatDialogRef<RegistroAdministradoresComponent>
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      mail: ['', [Validators.required]], 
      clave: ['', [Validators.required, Validators.minLength(6)]], 
    });
  }

  imagenCargada(event: any) {
    this.yaCargo = true;
    const input = event.target as HTMLInputElement;
    this.imagenes = input.files;
  }

  async enviar() {
    if (this.form.valid && (this.imagenes ? this.imagenes.length : 0) === 1) {
      let credenciales = await this.auth.register({
        email: this.form.value.mail,
        password: this.form.value.clave,
      });
      let fotos: string[] = [];

      for (let i = 0; i < this.imagenes.length; i++) {
        fotos.push(
          await this.storage.guardarFoto(this.imagenes[i], 'usuarios')
        );
      }

      let usuario = {
        datos: this.form.value,
        perfil: 'Administrador',
        credenciales: JSON.stringify(credenciales),
        fotos: fotos,
      };
      this.firestore.guardar(usuario, 'usuarios');
    } else {
      Swal.fire('ERROR', 'Verifique los campos ingresados', 'error');
    }

    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

}
