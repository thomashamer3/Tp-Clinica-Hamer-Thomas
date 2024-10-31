import { MatDialog } from '@angular/material/dialog';
import { FormEspecialistaComponent } from '../form-especialista/form-especialista.component';
import { FormPacienteComponent } from '../form-paciente/form-paciente.component';
import { RegistroAdministradoresComponent } from '../registro-administradores/registro-administradores.component';
import { MatIcon } from '@angular/material/icon';
import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [MatCardModule,
    MatCardTitle,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgIf,
    MatIcon,
    MatTableModule,
    MatCheckboxModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent {
  tableAdministradores : string[] = ['nombre','apellido','edad','dni','mail','imagenPerfil'];
  tablePacientes : string[] = ['nombre','apellido','edad','dni','obraSocial','mail','imagenPerfil1','imagenPerfil2'];
  tableDetalle : string[] = ['nombre','apellido','edad','dni','especialidades','mail','imagenPerfil','check'];
  
  lista : MatTableDataSource<any> = new MatTableDataSource<any>();
  listaPacientes : MatTableDataSource<any> = new MatTableDataSource<any>();
  listaAdministradores : MatTableDataSource<any> = new MatTableDataSource<any>();
  
  @ViewChild(MatTable) table!: MatTable<any>;

  isChecked : boolean = false;
  cargando : boolean = false;

  @ViewChild('paginator', {static: true}) paginator!: MatPaginator;
  @ViewChild('paginator2', {static: true}) paginator2!: MatPaginator;
  @ViewChild('paginator3', {static: true}) paginator3!: MatPaginator;

  async ngOnInit(){
    this.lista.paginator = this.paginator;
    this.listaPacientes.paginator = this.paginator2;
    this.listaAdministradores.paginator = this.paginator3;
    await this.actualizar();
  }

  constructor(private formBuilder:FormBuilder,private firestore:FirestoreService,
    private dialog: MatDialog){
  }

  async actualizar(){
    this.cargando = true;
    await this.firestore.obtener("usuarios").then((resultado:any)=>{
      let pacientes  = resultado.filter((element : any)=> element.data.perfil === "Paciente")
      this.listaPacientes.data = pacientes;

      let administradores  = resultado.filter((element : any)=> element.data.perfil === "Administrador")
      this.listaAdministradores.data = administradores;

      let especialistas  = resultado.filter((element : any)=> element.data.perfil === "Especialista" )
      this.lista.data = especialistas;
    })
    this.cargando = false;
  }

  async aprobarEspecialista(reg:any){
    reg.data.cuentaAprobada = !reg.data.cuentaAprobada;
    await this.firestore.modificar(reg,"usuarios")
    await this.actualizar();
  }

  verEspecialidades(reg:any){
    let especialidades = JSON.parse(reg.data.datos.especialidades)
    let itemsHtml = '<ul>';

    especialidades.forEach((element:any) => {
      itemsHtml += `<li>${element}</li>`;
    });

    itemsHtml += '</ul>';
  
    Swal.fire({
      title: 'Especialidades:',
      html: itemsHtml,
    });
  }

  agregarEspecialista(){
    const dialogRef = this.dialog.open(FormEspecialistaComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      this.actualizar();
    });
  }

  agregarPaciente(){
    const dialogRef = this.dialog.open(FormPacienteComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      this.actualizar();
    });
  }

  agregarAdministrador(){
    const dialogRef = this.dialog.open(RegistroAdministradoresComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      this.actualizar();
    });
  }

}
