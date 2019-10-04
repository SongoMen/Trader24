import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/performance";

const config = {
  apiKey: "AIzaSyDm7zrnUA3hk0kPzFhTXaVN5xGuB-3fbJs",
  authDomain: "stocks-af048.firebaseapp.com",
  databaseURL: "https://stocks-af048.firebaseio.com",
  projectId: "stocks-af048",
  storageBucket: "stocks-af048.appspot.com",
  messagingSenderId: "120406405318",
  appId: "1:120406405318:web:7edf6b661ae6e26b"
};

firebase.initializeApp(config);

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const firebaseAuth = firebase.auth;
export const db = firebase.firestore();
export const perf = firebase.performance();

export function loginWithGoogle() {
  return firebaseAuth().signInWithRedirect(googleProvider);
}

export function auth(email, pw) {
  let username = localStorage.getItem("user");
  return firebaseAuth()
    .createUserWithEmailAndPassword(email, pw)
    .then(function(newUser) {
      db.collection("users")
        .doc(newUser.user.uid)
        .set({
          email,
          username,
          funds: "100000",
          currentfunds: "100000",
          positions: "0",
          admin: false
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
      return firebase.auth().currentUser.updateProfile({
        displayName: username
      });
    });
}

export function logout() {
  return firebaseAuth().signOut();
}

export function login(email, pw) {
  return firebaseAuth().signInWithEmailAndPassword(email, pw);
}

export function resetPassword(email) {
  return firebaseAuth().sendPasswordResetEmail(email);
}
