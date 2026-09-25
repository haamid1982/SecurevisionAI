import {initializeApp} from 'firebase/app';
import {createUserWithEmailAndPassword,getAuth,GoogleAuthProvider,OAuthProvider,onIdTokenChanged,sendPasswordResetEmail,signInWithEmailAndPassword,signInWithPopup,signOut,updateProfile} from 'firebase/auth';

const firebaseConfig={
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured=Object.values(firebaseConfig).every(Boolean);
export const auth=firebaseConfigured?getAuth(initializeApp(firebaseConfig)):null;

if(auth)onIdTokenChanged(auth,async user=>{globalThis.__secureVisionToken=user?await user.getIdToken():null;});

export function observeFirebaseUser(callback){
  if(!auth){callback(null);return()=>{};}
  return onIdTokenChanged(auth,async user=>{
    globalThis.__secureVisionToken=user?await user.getIdToken():null;
    callback(user);
  });
}

export async function loginWithFirebase(email,password){
  if(!auth)throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* variables to .env.');
  const credential=await signInWithEmailAndPassword(auth,email,password);
  globalThis.__secureVisionToken=await credential.user.getIdToken();
  return credential.user;
}

export async function registerWithFirebase(email,password,fullName){
  if(!auth)throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* variables to .env.');
  const credential=await createUserWithEmailAndPassword(auth,email,password);
  if(fullName)await updateProfile(credential.user,{displayName:fullName});
  globalThis.__secureVisionToken=await credential.user.getIdToken(true);
  return credential.user;
}

export async function continueWithGoogle(){
  if(!auth)throw new Error('Firebase is not configured.');
  const credential=await signInWithPopup(auth,new GoogleAuthProvider());
  globalThis.__secureVisionToken=await credential.user.getIdToken();
  return credential.user;
}

export async function continueWithMicrosoft(){
  if(!auth)throw new Error('Firebase is not configured.');
  const credential=await signInWithPopup(auth,new OAuthProvider('microsoft.com'));
  globalThis.__secureVisionToken=await credential.user.getIdToken();
  return credential.user;
}

export async function logoutFirebase(){if(auth)await signOut(auth);globalThis.__secureVisionToken=null;}
export async function resetFirebasePassword(email){if(!auth)throw new Error('Firebase is not configured.');await sendPasswordResetEmail(auth,email);}
