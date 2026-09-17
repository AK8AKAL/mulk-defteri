// ============================================================
// Bu bilgileri Firebase Console > Proje Ayarları > Genel
// sekmesinden, "Web uygulaması" oluşturduktan sonra alacaksınız.
// README.md'deki kurulum adımlarını takip edin.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDmmoQJprJEfOSdPulCCDFSIHZCzhV9ylQ",
  authDomain: "mulk-defteri.firebaseapp.com",
  projectId: "mulk-defteri",
  storageBucket: "mulk-defteri.firebasestorage.app",
  messagingSenderId: "131768422387",
  appId: "1:131768422387:web:5556bb5836379ddf240c86"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
