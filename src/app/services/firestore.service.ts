import { Injectable, inject } from '@angular/core';
import {
  addDoc, collection, doc, getDocs, updateDoc, Firestore, onSnapshot, query
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore = inject(Firestore);

  constructor() { }

  guardar(data:any,ruta:string){
    const colRef = collection(this.firestore,ruta);
    return addDoc(colRef,data); 
  }

  async modificar (data: any,ruta:string){
    let retorno = false;
    const usuarioRef = collection(this.firestore,ruta);
      const documento = doc(usuarioRef,data.id)
      await updateDoc(documento,data.data)
        .then((respuesta)=>{
          retorno = true;
        })
        .catch((error) => {
      });
      return retorno;
  }

  
  async obtener(ruta:string)
  {
    let array :any[]=[];
    const querySnapshot = await getDocs(collection(this.firestore,ruta));
    querySnapshot.forEach((doc) => {
      let data = {
        id : doc.id,
        data : doc.data()
      }
      array.push(data);
    });
    return array;
    
  }

  escucharCambios (ruta:string, callback: (data: any[]) => void) {
    let datos :any[]=[];
    const q = query(collection(this.firestore, ruta));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      datos = [];
      querySnapshot.forEach((doc:any) => {
        let data = {
          id : doc.id,
          data : doc.data()
        }
        datos.push(data);
      });
      callback(datos);
    });
    return datos;
  }
}
