import { Component, ElementRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    NgIf,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  cargando: boolean = false;
  showUserOptions: boolean = false;
  fb = inject(FormBuilder);
  authService = inject(FirebaseAuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  errorMessage: string = '';

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit() {
    let ls = localStorage.getItem('usuario');

    if (ls !== undefined && ls !== 'undefined') {
      let usuario = JSON.parse(ls ? ls : '{}');
      if (usuario && usuario.user) {
        this.router.navigate(['menu']);
      }
    }
  }

  async ingresar() {
    this.errorMessage = '';
    this.cargando = true;
    if (this.form.valid) {
      let credenciales = await this.authService.login({
        email: this.form.value.email,
        password: this.form.value.password,
      });
      localStorage.setItem('usuario', JSON.stringify(credenciales));
      this.router.navigate(['menu']);
    } else {
      this.errorMessage =
        'Error al iniciar sesión. Por favor, verifica tus credenciales.';
    }
    this.cargando = false;
  }

  volver() {
    this.router.navigateByUrl('/bienvenida');
  }
  toggleUserOptions() {
    this.showUserOptions = !this.showUserOptions;
  }
  userX(email: string, password: string) { 
    this.form.setValue({
      email: email,
      password: password,
    });
}

}
