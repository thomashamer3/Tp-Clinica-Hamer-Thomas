import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings, RECAPTCHA_LANGUAGE } from 'ng-recaptcha';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'tpclinicalabhamer',
        appId: '1:95559207903:web:1b1c1ed0dab91e0122526a',
        storageBucket: 'tpclinicalabhamer.appspot.com',
        apiKey: 'AIzaSyBDSyOSJwreZGPl8ifcBJRQ9JDIQWQgixk',
        authDomain: 'tpclinicalabhamer.firebaseapp.com',
        messagingSenderId: '95559207903',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()), provideAnimationsAsync(),
    provideHttpClient(),
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: '6LeWnn4qAAAAAOnQHsa4PdKgaTmKBeUVbzZmv6we' } 
    },
    { provide: RECAPTCHA_LANGUAGE, useValue: 'es' } 
  ]
};
