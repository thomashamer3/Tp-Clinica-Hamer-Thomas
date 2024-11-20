import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private http: HttpClient) {
  }

  obtenerFechaFormato(fecha:any){
    const fechaForm = fecha.toDate();
    const dia = fechaForm.getDate();
    const mes = fechaForm.getMonth() + 1;
    const año = fechaForm.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  }

  async generatePdf(paciente: any,historias:any) {
    const currentDate = new Date().toLocaleDateString();

    const imagen = await this.getDataUrl(paciente.fotos[1])

    const documentDefinition = {
      content: [

        {
          text: 'Historia clinica',
          style: 'title'
        },
        {
          text: `Fecha del informe: ${currentDate}`,
          style: 'date'
        },

        { text: '\n', margin: [0, 10] },

        {
          columns: [
            {
              width: 'auto',
              image: 'data:image/png;base64,'+imagen, 
              fit: [100, 100], 
              alignment: 'left',
              margin:  [ 5, 5, 5, 5 ] 
            },
            {
              width: '*',
              stack: [
                { text: 'Datos del Paciente', style: 'header' },
                { text: `Nombre: ${paciente.datos.nombre}` },
                { text: `Apellido: ${paciente.datos.apellido}` },
                { text: `Correo: ${paciente.datos.mail}` },
                { text: `Edad: ${paciente.datos.edad}` },
                { text: `DNI: ${paciente.datos.dni}` },
                { text: `Obra social: ${paciente.datos.obraSocial}` },
              ],
              alignment: 'left'
            },
            {
              width: 'auto',
              image: 'data:image/png;base64,'+ await this.getDataUrl("https://firebasestorage.googleapis.com/v0/b/tpclinicalabhamer.appspot.com/o/favicon.ico?alt=media&token=b3cd2af5-559e-4da2-890b-d471e2ee4905"),
              fit: [200, 200], 
              alignment: 'right'
            }
          ]
        },
        { text: '\n', margin: [0, 10] },
        {
          text: 'Historia Clínica',
          style: 'header'
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Fecha', 'Especialidad', 'Especialista', 'Altura [cm]', 'Peso [kg]', 'Temperatura [°C]', 'Presión [mmHg]'],
              ...historias.map((element:any) => [
                this.obtenerFechaFormato(element.data.turno.fecha),
                element.data.turno.especialidad,
                element.data.turno.especialista,
                element.data.altura,
                element.data.peso,
                element.data.temperatura,
                element.data.presion
              ])
            ]
          },
          margin: [0, 10]
        }
      ],
      styles: {
        title: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        date: {
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        }
      },
    };

    (pdfMake as any).createPdf(documentDefinition).open();
  }

  private async getDataUrl(url: string) {
    return new Promise<any>((resolve,reject)=>{
      this.http.get(url, { responseType: 'arraybuffer' }).subscribe((imageData: ArrayBuffer) => {
        const binary = new Uint8Array(imageData);
        const bytes :any = [];
        binary.forEach((byte) => {
          bytes.push(String.fromCharCode(byte));
        });
        resolve(btoa(bytes.join('')))
      });
    })

  }
}
