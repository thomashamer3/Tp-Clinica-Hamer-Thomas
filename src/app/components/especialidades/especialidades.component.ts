import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [MatCardModule,
    MatCardTitle,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgIf,
    MatTableModule,
    MatCheckboxModule],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.css'
})
export class EspecialidadesComponent {

  tableDetalle: string[] = ['especialidad', 'check'];
  lista: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatTable) table!: MatTable<any>;
  isChecked: boolean = false;
  cargando: boolean = false;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  yaCargo: boolean = false;
  imagenes : any;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private firestore: FirestoreService,
    private storage:StorageService,
    public dialogRef: MatDialogRef<EspecialidadesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.formBuilder.group({
      especialidad: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    this.lista.paginator = this.paginator;
    await this.actualizar();
    if (this.data.lista.length) {
      this.data.lista.forEach((i: any) => {
        this.lista.data.forEach(j => {
          if (j.data.nombre === i.nombre) {
            j.data.estaMarcado = true;
          }
        });
      });
    }
  }

  async actualizar(){
    this.cargando = true;
    await this.firestore.obtener("especialidades").then((resultado:any)=>{
      this.lista.data = resultado;
    })
    this.cargando = false;
  }

  traerSeleccionados(){
    let seleccionados : any[] = [];
    this.lista.data.forEach((element) => {
      if(element.data.estaMarcado){
        seleccionados.push(element.data);
      }
    });
    return seleccionados;
  }

  ngOnDestroy() {
    this.dialogRef.close(this.traerSeleccionados())
  }

  async agregarEspecialidad(){
    let formValido = this.form.valid && (this.imagenes ? this.imagenes.length : 0 ) === 1
    this.cargando = true;
    if(formValido){
      let foto = await this.storage.guardarFoto(this.imagenes[0],"especialidades")
      await this.firestore.guardar({nombre:this.form.value.especialidad,estaMarcado:false,foto:foto},"especialidades");
      await this.actualizar();
    }else{
      Swal.fire("ERROR","Ingrese los campos requeridos","error");
    }
    this.cargando = false;
    this.form.reset();
  }

  cargarImagen(event:any){
    this.yaCargo = true;
    const input = event.target as HTMLInputElement;
    this.imagenes = input.files;

  }
}