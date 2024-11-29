import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormPacienteComponent } from '../../components/form-paciente/form-paciente.component';

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [MatCardModule, FormPacienteComponent],
  templateUrl: './registro-pacientes.component.html',
  styleUrl: './registro-pacientes.component.css',
})
export class RegistroPacientesComponent {}
