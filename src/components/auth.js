import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyDm7zrnUA3hk0kPzFhTXaVN5xGuB-3fbJs",
    authDomain: "stocks-af048.firebaseapp.com",
    databaseURL: "https://stocks-af048.firebaseio.com",
    projectId: "stocks-af048",
    storageBucket: "stocks-af048.appspot.com",
    messagingSenderId: "120406405318"
  };

firebase.initializeApp(config)

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth

export function loginWithGoogle() {
  return firebaseAuth().signInWithRedirect(googleProvider);
}

export function auth (email, pw) {
  var username = localStorage.getItem('user')
  return firebaseAuth().createUserWithEmailAndPassword(email, pw)
    .then(function() {
      return firebase.auth().currentUser.updateProfile({  
        displayName:username
      });
    })
  }

export function logout () {
  return firebaseAuth().signOut()
}

export function login (email, pw) {
  return firebaseAuth().signInWithEmailAndPassword(email, pw)
}

export function resetPassword (email) {
  return firebaseAuth().sendPasswordResetEmail(email)
}

