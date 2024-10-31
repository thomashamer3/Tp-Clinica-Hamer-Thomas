import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user, sendEmailVerification } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { FirestoreService } from './firestore.service';
@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  firebaseAuth = inject(Auth);

  private firestore = inject(FirestoreService);


  async register({email,password}:any){

    return (await createUserWithEmailAndPassword(this.firebaseAuth,email,password)
      .then(async (resultado)=>{
        if(this.firebaseAuth.currentUser)
          (await sendEmailVerification(this.firebaseAuth.currentUser)
            .then((resultado)=>{
                Swal.fire("OK","Mail de verificacion enviado, verifiquelo para ingresar","success");
            })
            .catch((error)=>{
              Swal.fire("ERROR","No se pudo enviar el mail de confirmacion","error");
            }))
            return resultado;
      })
      .catch((error)=>{
        console.log(error)
        Swal.fire("ERROR","No se pudo crear el usuario","error");
      }))
  }

  async obtetenerUsuarioLogueadoBase(uid: any){
    let retorno : any;
    let usuarios = await this.firestore.obtener("usuarios");
      usuarios.forEach((element : any) => {
        let credencialesBase = JSON.parse(element.data.credenciales ? element.data.credenciales : "{}")
        if(credencialesBase.user.uid === uid){
          retorno = element;
        }
      });
    return retorno;
  }

  async login({email,password}:any){

    return signInWithEmailAndPassword(this.firebaseAuth,email,password)
      .catch((error)=>{ 
        Swal.fire("ERROR","Usuario no autorizado","error");
      })
  }

  async getUsuarioLogueado(){
    let usuario = null;
    const ls = localStorage.getItem("usuario");
    if(ls)
      usuario = JSON.parse(ls);

    return await this.obtetenerUsuarioLogueadoBase(usuario.user.uid);
  }


  logout(){
      localStorage.clear();
      return signOut(this.firebaseAuth);
  }
}
