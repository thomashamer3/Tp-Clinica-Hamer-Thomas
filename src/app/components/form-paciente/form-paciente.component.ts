import { Component , ElementRef, inject, Input, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl} from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-form-paciente',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatIconModule],
  templateUrl: './form-paciente.component.html',
  styleUrl: './form-paciente.component.css'
})
export class FormPacienteComponent {
  imagenes : any;
  yaCargo : boolean = false;
  @Input() mostrarVolver : boolean = false;

  fb = inject(FormBuilder);
  authService = inject(FirebaseAuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);
  firestore = inject(FirestoreService);
  storage = inject(StorageService);
 

  constructor(@Optional() public dialogRef: MatDialogRef<FormPacienteComponent>){}
  
  form = this.fb.group({
    edad: ['',[Validators.required,Validators.min(18),Validators.max(99)]],
    dni: ['', [Validators.required,Validators.pattern('^[0-9]{1,3}\?[0-9]{3,3}\?[0-9]{3,3}$')]],
    mail: ['', [Validators.required,Validators.email]],
    clave: ['', [Validators.required,Validators.minLength(6)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    obraSocial: ['',[Validators.required]],
  });

  imagenCargada(event:any){
    this.yaCargo = true;
    const input = event.target as HTMLInputElement;
    this.imagenes = input.files;
  }

  async enviar(){
    
    if(this.form.valid && (this.imagenes ? this.imagenes.length : 0 ) === 2){
      let credenciales = await this.authService.register({email:this.form.value.mail,password:this.form.value.clave})
      let fotos : string[] = [];

      for (let i = 0; i < this.imagenes.length; i++) {
        fotos.push(await this.storage.guardarFoto(this.imagenes[i],"usuarios"))
      }

      let usuario = {
        datos : this.form.value,
        perfil: "Paciente",
        credenciales: JSON.stringify(credenciales),
        fotos: fotos
      }
      this.firestore.guardar(usuario,"usuarios")
    }else{
      Swal.fire("ERROR","Verifique los campos ingresados","error");
    }

    if(this.dialogRef){
      this.dialogRef.close();
    }
  }

  volver(){
    this.router.navigate(["bienvenida"])
  }
}
