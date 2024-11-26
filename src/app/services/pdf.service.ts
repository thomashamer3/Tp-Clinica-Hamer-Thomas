import { Injectable } from '@angular/core';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private http: HttpClient) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
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
    //console.log(historias)
    const documentDefinition = {
      content: [
        // Título e información de fecha
        {
          text: 'Historia clinica',
          style: 'title'
        },
        {
          text: `Fecha del informe: ${currentDate}`,
          style: 'date'
        },
        // Separador entre el título y el contenido principal
        { text: '\n', margin: [0, 10] },
        // Sección superior con la foto del paciente y datos
        {
          columns: [
            // Columna izquierda con la foto del paciente
            {
              width: 'auto',
              image: 'data:image/png;base64,'+imagen, // Reemplaza con la URL real de la foto del paciente
              fit: [100, 100], // Ajusta el tamaño según sea necesario
              alignment: 'left',
              margin:  [ 5, 5, 5, 5 ] 
            },
            // Columna derecha con los datos del paciente y el logo de la clínica
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
                // Agrega otros datos del paciente según sea necesario
              ],
              alignment: 'left'
            },
            // Columna adicional a la derecha con el logo de la clínica
            {
              width: 'auto',
              image: 'data:image/png;base64,'+ await this.getDataUrl("https://firebasestorage.googleapis.com/v0/b/laboratorioivtpclinicaaranda.appspot.com/o/logo.png?alt=media&token=cd1e83e7-61a1-479c-9f1f-be4162d2afae"), // Reemplaza con la URL real del logo de la clínica
              fit: [200, 200], // Ajusta el tamaño según sea necesario
              alignment: 'right'
            }
          ]
        },
        // Separador entre las secciones
        { text: '\n', margin: [0, 10] },
        // Sección inferior con los datos de la historia clínica como tabla
        {
          text: 'Historia Clínica',
          style: 'header'
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Fecha', 'Especialidad', 'Especialista', 'Altura [cm]', 'Peso [kg]', 'Temperatura [°C]', 'Presión [mmHg]'],
              // Agrega las filas de datos
              ...historias.map((element:any) => [
                this.obtenerFechaFormato(element.data.turno.fecha),
                element.data.turno.especialidad,
                element.data.turno.especialista,
                element.data.altura,
                element.data.peso,
                element.data.temperatura,
                element.data.presion
                // Agrega más columnas según sea necesario
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
