import { Component } from '@angular/core';
import { FormPacienteComponent } from "../form-paciente/form-paciente.component";

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [FormPacienteComponent],
  templateUrl: './registro-pacientes.component.html',
  styleUrl: './registro-pacientes.component.css'
})
export class RegistroPacientesComponent {

}
