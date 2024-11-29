import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

  obtenerFechaFormato(fecha: any) {
    const fechaForm = fecha.toDate();
    const dia = fechaForm.getDate();
    const mes = fechaForm.getMonth() + 1;
    const año = fechaForm.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  }

  async generatePdf(paciente: any, historias: any) {
    const currentDate = new Date().toLocaleDateString();

    // Obtener las imágenes en formato base64
    const logoImage = await this.getDataUrl(
      'https://firebasestorage.googleapis.com/v0/b/tpclinicalabhamer.appspot.com/o/hospital.png?alt=media&token=997449bd-eacc-444c-b781-73a0cf4950b3'
    );
    const profileImage = await this.getDataUrl(paciente.fotos[0]); // Asumiendo que la primera foto es la del paciente

    // Crear una instancia de jsPDF
    const doc = new jsPDF();

    // Agregar el logo en la esquina superior derecha
    doc.addImage('data:image/png;base64,' + logoImage, 'PNG', 160, 10, 40, 40);

    // Agregar el título e información de fecha
    doc.setFontSize(20);
    doc.text('Historia Clínica', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Fecha del informe: ${currentDate}`, 105, 30, { align: 'center' });

    // Agregar la foto del paciente arriba de los datos del paciente
    doc.addImage(
      'data:image/png;base64,' + profileImage,
      'PNG',
      10,
      40,
      40,
      40
    );

    // Agregar los datos del paciente
    doc.setFontSize(14);
    doc.text('Datos del Paciente', 10, 90);
    doc.setFontSize(12);
    doc.text(`Nombre: ${String(paciente.datos.nombre)}`, 10, 100);
    doc.text(`Apellido: ${String(paciente.datos.apellido)}`, 10, 110);
    doc.text(`Correo: ${String(paciente.datos.mail)}`, 10, 120);
    doc.text(`Edad: ${String(paciente.datos.edad)}`, 10, 130);
    doc.text(`DNI: ${String(paciente.datos.dni)}`, 10, 140);
    doc.text(`Obra Social: ${String(paciente.datos.obraSocial)}`, 10, 150);

    // Dejar un poco de espacio antes de la tabla
    let currentY = 160;

    // Título de la sección de Historia Clínica
    doc.setFontSize(14);
    doc.text('Historia Clínica', 10, currentY);

    // Definir los encabezados de la tabla
    const headers = [
      'Fecha',
      'Especialidad',
      'Especialista',
      'Altura [cm]',
      'Peso [kg]',
      'Temperatura [°C]',
      'Presión [mmHg]',
    ];

    // Formato de las filas
    const tableData = historias.map((element: any) => [
      this.obtenerFechaFormato(element.data.turno.fecha),
      String(element.data.turno.especialidad), // Convertir a String
      String(element.data.turno.especialista), // Convertir a String
      String(element.data.altura), // Convertir a String
      String(element.data.peso), // Convertir a String
      String(element.data.temperatura), // Convertir a String
      String(element.data.presion), // Convertir a String
    ]);

    // Agregar los encabezados de la tabla
    currentY += 10; // Espacio después del título
    let startX = 10;
    let columnWidth = 28; // Ajustar el ancho de las columnas
    doc.setFontSize(10);

    headers.forEach((header, index) => {
      doc.text(header, startX + index * columnWidth, currentY);
    });

    // Agregar las filas de la tabla
    currentY += 10; // Espacio después de los encabezados
    tableData.forEach((row: string[]) => {
      row.forEach((cell, index) => {
        doc.text(cell, startX + index * columnWidth, currentY);
      });
      currentY += 10; // Espacio entre las filas
    });

    // Guardar el PDF
    doc.save(`${String(paciente.datos.apellido)}_Historia_Clinica.pdf`);
  }

  private async getDataUrl(url: string) {
    return new Promise<any>((resolve, reject) => {
      this.http
        .get(url, { responseType: 'arraybuffer' })
        .subscribe((imageData: ArrayBuffer) => {
          const binary = new Uint8Array(imageData);
          const bytes: any = [];
          binary.forEach((byte) => {
            bytes.push(String.fromCharCode(byte));
          });
          resolve(btoa(bytes.join('')));
        });
    });
  }
}
