import { AfterContentInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { DatosPerfilComponent } from '../datos-perfil/datos-perfil.component';
import { MatDialog } from '@angular/material/dialog';
import { HistoriaClinicaComponent } from '../historia-clinica/historia-clinica.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { DoctorPipe } from '../../pipes/doctor.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { FechasPipe } from '../../pipes/fechas.pipe';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-historia-clinica-form',
  standalone: true,
  imports: [NgIf, MatCard, MatCardTitle, NgFor, MatTooltipModule, MatTable, MatIcon, CommonModule, DoctorPipe, MatPaginator, ReactiveFormsModule, MatProgressSpinnerModule, MatFormField, MatLabel, MatSelect, MatOption, MatTableModule, FechasPipe],
  templateUrl: './historia-clinica-form.component.html',
  styleUrl: './historia-clinica-form.component.css'
})
export class HistoriaClinicaFormComponent implements AfterContentInit{

  cargando:boolean = false;
  historiasClinicas : any;
  usuario : any;
  lista : MatTableDataSource<any> = new MatTableDataSource<any>();
  form: FormGroup;
  tableDetalle : string[] = ['fecha','paciente','especialista','especialidad','acciones'];
  tablaExcel : string[] = ['fecha','paciente','especialista','especialidad'];
  pacientes:any = [];
  turnos:any = [];
  pacienteSeleccionado : any = null;
  especialistasFiltrados : any = []; 

  @ViewChild('tablaUno') tablaUno!: ElementRef;

  @ViewChild('paginator', {static: false}) set paginator(value: MatPaginator) {
    if(this.lista) {
      this.lista.paginator = value;
    }
  }

  constructor(private firestore:FirestoreService,private auth: FirebaseAuthService,public dialog: MatDialog, private formBuilder: FormBuilder, private PdfService:PdfService){
    this.lista.paginator = this.paginator;

    this.form = this.formBuilder.group({
      especialista: [null, [Validators.required]],
    });
  }

  ngAfterContentInit(): void {
    console.log(this.paginator)
    this.lista.paginator = this.paginator;
  }


  async ngOnInit(){
    this.cargando = true;
    this.historiasClinicas = await this.firestore.obtener("historiaClinica");
    this.turnos = await this.firestore.obtener("turnos");
    this.usuario = await this.auth.getUsuarioLogueado();

    if(this.usuario.data.perfil==="Paciente"){
      this.tableDetalle = ['fecha','especialista','especialidad','acciones'];
      let historiasPaciente = this.historiasClinicas.filter((historia:any)=> (historia.data.paciente.id === this.usuario.id))
      let aux :any[] = [];
      historiasPaciente.forEach((historia:any) => {
        if(!aux.includes(historia.data.especialista.id)){
          this.especialistasFiltrados.push(historia.data.especialista)
          aux.push(historia.data.especialista.id)
        }
      });

    }else if (this.usuario.data.perfil==="Especialista" || this.usuario.data.perfil==="Administrador"){
      
      let historiasPacientes;

      if(this.usuario.data.perfil==="Especialista"){
        this.tableDetalle = ['fecha','paciente','especialidad','acciones'];
        historiasPacientes = this.historiasClinicas.filter((historia:any)=> historia.data.especialista.id === this.usuario.id)
      }else{
        this.tableDetalle = ['fecha','paciente','especialidad','especialista','acciones'];
        historiasPacientes = this.historiasClinicas;
      }
        

      let aux :any[] = [];
      historiasPacientes.forEach((element:any) => {
        if(!aux.includes(element.data.paciente.datos.apellido)){
          this.pacientes.push(element.data.paciente)
          aux.push(element.data.paciente.datos.apellido)
        }
        
      });
      console.log(this.pacientes)
      this.lista.data = [];
    }
    this.cargando = false;
  }

  
  public selectEspecialista = function (option: any, value: any): boolean {

    if (value == null) {
      return false;
    }
    
    return option.id === value.id;
  }

  actualizarTabla(){
    if(this.form.valid){
      this.lista.data = this.historiasClinicas.filter((historia:any)=> (historia.data.paciente.id === this.usuario.id && historia.data.especialista.id === this.form.value.especialista.id ))
    }
  }

  exportarExcel(){
    
    if(this.pacienteSeleccionado !== null){
      let nombreArchivo = this.pacienteSeleccionado.datos.apellido.toString()

      // Crear un libro de Excel
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      // Hoja de Pacientes
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tablaUno.nativeElement);
      XLSX.utils.book_append_sheet(wb, ws, 'Turnos');

      // Guardar en el archivo
      XLSX.writeFile(wb, nombreArchivo+'.xlsx');
    }
  }

  verEspecialista(elemento:any){

    let dato;
    if(this.usuario?.data?.perfil === 'Especialista' || this.usuario?.data?.perfil === 'Administrador'){
      dato = elemento.especialistaObj;
    }else{
      dato = elemento.data.turno.especialistaObj;
    }

    const dialogRef = this.dialog.open(DatosPerfilComponent, {
      data: {datos : dato},//
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((result:any) => {

    });
  }



  verPaciente(elemento:any){

    let dato;
    if(this.usuario?.data?.perfil === 'Especialista' || this.usuario?.data?.perfil === 'Administrador'){
      dato = elemento.pacienteObj;
    }else{
      dato = elemento.data.turno.pacienteObj;
    }

    const dialogRef = this.dialog.open(DatosPerfilComponent, {
      data: {datos :  dato},
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((result:any) => {

    });
  }

  verHistoria(elemento:any){
    let dato;
    if(this.usuario?.data?.perfil === 'Especialista' || this.usuario?.data?.perfil === 'Administrador'){
      dato = elemento;
    }else{
      dato = elemento.data.turno;
    }

    const dialogRef = this.dialog.open(HistoriaClinicaComponent, {
      data: {consulta:true,turno:dato},
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result:any) => {

    });
  }


  async verTurnos(paciente?:any ){
    this.pacienteSeleccionado = paciente
    let aux : any [] = [];
    this.turnos.forEach((turno:any) => {
      turno.data.dia.forEach((dia:any) => {
        dia.hora.forEach((hora:any) => {
          if((this.usuario.data.perfil==="Especialista" &&  turno.data.especialista.id === this.usuario.id && hora.paciente.id === paciente.id) ||
            (hora.paciente.id === paciente.id && this.usuario.data.perfil !=="Especialista" )){
            let turnoFormateado = this.crearFormatoTurno(turno,dia,hora);
            aux.push(turnoFormateado);
          }
        });
      });
    });
    this.lista.data = aux;
  }

  private crearFormatoTurno(turno:any,dia:any,hora:any){
    let turnoFormateado : any = {};
    turnoFormateado.especialistaId = turno.data.especialista.id
    turnoFormateado.especialista = turno.data.especialista.data.datos.apellido
    turnoFormateado.especialistaObj = turno.data.especialista.data
    turnoFormateado.especialistaObj.id = turno.data.especialista.id
    turnoFormateado.fecha = new Date(dia.fecha)
    turnoFormateado.especialidad = dia.especialidad.data.nombre
    turnoFormateado.especialidadObj = dia.especialidad.data
    turnoFormateado.especialidadObj.id = dia.especialidad.id
    turnoFormateado.horario = hora.horario
    turnoFormateado.estado = hora.estado
    turnoFormateado.paciente = hora.paciente.data.datos.apellido
    turnoFormateado.pacienteObj = hora.paciente.data
    turnoFormateado.pacienteObj.id = hora.paciente.id
    turnoFormateado.turnoObj = turno;
    turnoFormateado.comentario = hora.comentario;
    turnoFormateado.diagnostico = hora.diagnostico;
    return turnoFormateado;
  }

  verComentario(turno:any){
    if (turno.diagnostico) {
      Swal.fire({
        title: 'Información del turno',
        html: `Comentario: ${turno.comentario}<br>Diagnóstico: ${turno.diagnostico}`,
        icon: 'info',
      });
    } else {
      if(turno.estado === "Cancelado"){
        Swal.fire({
          title: 'Comentario de por qué se canceló el turno:',
          text: turno.comentario,
          icon: 'info',
        });
      }else{
        Swal.fire({
          title: 'Comentario de por qué se rechazo el turno:',
          text: turno.comentario,
          icon: 'info',
        });
      }
    }
  }

  async guardarHistoriaClinica(){
    if(this.form.valid){
      let historias = this.lista.data
      let paciente = historias[0].data.paciente
      await this.PdfService.generatePdf(paciente,historias);
    }else{
      Swal.fire("ERROR","Debe seleccionar un especialista","error");
    }

  }

}


/*
"* Sacar un turno
 - Comienza mostrando las ESPECIALIDADES en botones con la imagen de la especialidad, en caso de no tener muesra imagen por default. 
 Deben ser botones rectangulares con el nombre de la especialidad debajo.

 - Una vez seleccionada mostrará los PROFESIONALES, en botones con la imagen de perfil de cada profesional y su nombre arriba de la foto. 
 Estos botones deben ser rectangulares. LISTO

- Una vez seleccionado el profesional, aparecerán los días con turnos disponibles para ese PROFESIONAL. 
Estos botones deben ser rectangulares. Formato (09 de Septiembre).

 - Seleccionado el día mostrará los horarios disponibles. Estos botones deben ser rectangulares. Formato (13:15)LISTO.



 "
 SPRINT 3
---------------------------------------
Sección Pacientes ->	"Para los especialistas. Solo deberá mostrar los usuarios que el
especialista haya atendido al menos 1 vez."	Además, Mostrar los usuarios con un favbutton redondo , imagen y nombre, al seleccionar un paciente  se muestra los dellaes de los turnos y un acceso a la reseña de cada consulta, LISTO
---------------------
Sección usuarios ->	"Solamente para el perfil Administrador, poder descargar un excel con los datos de todos los
usuarios."	

Además, mostrar los usuarios de esta sección con un favbutton redondo, imagen y nombre. Al seleccionarlo descarga los datos de que turnos tomo y con quien (también en excel)
-----------------------------


Mi perfil ->	"Para los usuarios paciente, poder descargar un pdf con la historia clínica. El PDF tiene que tener
logo de la clínica, título del informe y fecha de emisión."	Además, debe haber una forma para poder bajar todas las atenciones que realice segun un PROFESIONAL (También en PDF)

---------------------------
Animaciones ->	"Se debe agregar al menos 2, como mínimo, animaciones de transición entre componentes al navegar
la aplicación."	Una debe ser de Derecha a izquierda

*/