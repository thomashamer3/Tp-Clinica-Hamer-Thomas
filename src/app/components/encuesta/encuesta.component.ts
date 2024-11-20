import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { MatCard } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [MatCard, ReactiveFormsModule, NgIf, MatSlider],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent {

  indice = 0;
  encuesta : any;
  pregunta1 = "¿Cómo calificaría su experiencia general con la clínica en línea?";
  pregunta2 = "¿Qué tan satisfecho/a está con la facilidad de acceso a los servicios de la clínica online?";
  pregunta3 = "¿La plataforma de la clínica cumplió con sus expectativas en términos de usabilidad?";
  pregunta4 = "¿Recomendaría esta clínica en línea a otros pacientes?";
  pregunta5 = "En una escala del 1 al 10, ¿cómo calificaría su experiencia general con la clínica en línea?";
  pregunta6 = "¿Tiene algún comentario adicional sobre su experiencia con el especialista ?";

  turnos : any ;
  diaEncuesta:any;
  horaEncuesta:any;
  esEncuesta : boolean = false;
  form!: FormGroup;
  formEspe!: FormGroup;
  @ViewChild('itemHeight') slider : any;
  @ViewChild('comentario') comentario : any;

  respuestas = [
    ["","Muy insatisfecho","Insatisfecho","Neutral","Satisfecho","Muy Satisfecho"],
    ["","No cumplió para nada","No cumplió","Cumplió parcialmente","Cumplió","Cumplió completamente"],
    ["","Definitivamente no","Probablemente no","No estoy seguro/a","Probablemente sí","Definitivamente sí"]
  ]

  
  
  constructor(private formBuilder:FormBuilder,@Inject(MAT_DIALOG_DATA) public data: any,
  private firestore: FirestoreService,private dialogRef : DialogRef){

    if(this.data.tipo === "Encuesta"){
      this.esEncuesta = true;
    }
  }

  sonFechasIguales(fecha1: Date, fecha2: Date): boolean {
    return (
      fecha1.getDate() === fecha2.getDate() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getFullYear() === fecha2.getFullYear()
    );
  }

  private yaCargoEncuesta(){
    let retorno = null;
    for (let i = 0; i < this.turnos.length; i++) {
      let turno = this.turnos[i]
      if(this.data.datos.turnoObj.id === turno.id){
        for (let j = 0; j < turno.data.dia.length; j++) {
          let dia = turno.data.dia[j]
          if(this.sonFechasIguales(new Date(dia.fecha),this.data.datos.fecha)){
            this.diaEncuesta = j;
            for (let k = 0;k < dia.hora.length; k++) {
              let hora = dia.hora[k];
              if(hora.horario === this.data.datos.horario ){
                this.horaEncuesta = k
                if(hora.encuesta && this.esEncuesta){
                  retorno= hora.encuesta;
                  break;
                }else if(hora.encuestaExperiencia && !this.esEncuesta){
                  retorno = hora.encuestaExperiencia
                  break;
                }
              }
            }
          }
        }
        if(retorno !== null)
          break;
      }
      if(retorno !== null)
      break;
    }
    return retorno;
  }

  async ngOnInit(){

    this.form = this.formBuilder.group({
      pregunta1: ['', [Validators.required]],
      pregunta2: ['', [Validators.required]],
      pregunta3: ['', [Validators.required]],
      pregunta4: ['', [Validators.required]],
    });

    this.formEspe = this.formBuilder.group({
      calificacion: ['5', [Validators.required]],
      comentario: ['', [Validators.required]],
    });

    this.turnos = await this.firestore.obtener("turnos")

     this.encuesta = this.yaCargoEncuesta();

     if(this.encuesta !== null && this.esEncuesta){
        this.dialogRef.close();
        const html = `
        <div  style="text-align: left">
          <h6>Usted ya completo la encuesta, estas fueron sus respuestas</h6><br><br>
          <h5>1.${this.pregunta1}</h5>
          <h5>Respuesta:<strong>${this.respuestas[0][this.encuesta.pregunta1]}</strong></h5>
          <h5>2.${this.pregunta2}</h5>
          <h5>Respuesta:<strong>${this.respuestas[0][this.encuesta.pregunta2]}</strong></h5>
          <h5>3.${this.pregunta3}</h5>
          <h5>Respuesta:<strong>${this.respuestas[1][this.encuesta.pregunta3]}</strong></h5>
          <h5>4.${this.pregunta4}</h5>
          <h5>Respuesta:<strong>${this.respuestas[2][this.encuesta.pregunta4]}</strong></h5>
        </div>
        `
        Swal.fire("Encuesta:",html,"info")
     }else if (this.encuesta !== null && !this.esEncuesta){
      this.dialogRef.close();
      const html = `
      <div  style="text-align: left">
        <h6>Usted ya completo la encuesta, estas fueron sus respuestas</h6><br><br>
        <h5>1.${this.pregunta5}</h5>
        <h5>Calificacion:<strong>${this.encuesta.calificacion}</strong></h5>
        <h5>2.${this.pregunta6}</h5>
        <h5>Comentario:<strong>${this.encuesta.comentario}</strong></h5>
      </div>
      `
      Swal.fire("Encuesta:",html,"info")
     }
  }


  siguiente(){
    this.indice = 1;
  }

  atras(){
    this.indice = 0;
  }

  async enviarExperiencia(){
    this.formEspe.get("calificacion")?.setValue(this.slider.nativeElement.value)

    if(this.formEspe.valid){
      let aux : any = {};
      
      this.data.datos.turnoObj.data.dia[this.diaEncuesta].hora[this.horaEncuesta].encuestaExperiencia = this.formEspe.value;
 
      aux.data =  this.data.datos.turnoObj.data;
      aux.id = this.data.datos.turnoObj.id;
      await this.firestore.modificar(aux,"turnos")
       this.dialogRef.close()
      Swal.fire("OK","Encuesta completada de manera correcta","success")
     }else{
       Swal.fire("ERROR","Faltan preguntas por responder","error")
     }
   }



  async enviar(){

    if(this.form.valid){
     let aux : any = {};

     this.data.datos.turnoObj.data.dia[this.diaEncuesta].hora[this.horaEncuesta].encuesta = this.form.value;

     aux.data =  this.data.datos.turnoObj.data;
     aux.id = this.data.datos.turnoObj.id;
     await this.firestore.modificar(aux,"turnos")
      this.dialogRef.close()
     Swal.fire("OK","Encuesta completada de manera correcta","success")
    }else{
      Swal.fire("ERROR","Faltan preguntas por responder","error")
    }
  }

}
