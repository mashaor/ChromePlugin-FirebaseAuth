import { signInWithPopup, SAMLAuthProvider, getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js' //'firebase/auth';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js' //'firebase/app';
import firebaseConfig from './firebaseConfig.js'

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// This code runs inside of an iframe in the extension's offscreen document.
// This gives you a reference to the parent frame, i.e. the offscreen document.
// You will need this to assign the targetOrigin for postMessage.
const PARENT_FRAME = document.location.ancestorOrigins[0];

// This demo uses the SAML auth provider, but any supported provider works.
// Make sure that you enable any provider you want to use in the Firebase Console.
// https://console.firebase.google.com/project/_/authentication/providers
const PROVIDER = new SAMLAuthProvider("saml.dev");

function sendResponse(result) {
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
}

globalThis.addEventListener('message', function({data}) {

  console.log(`IFrame message recieved`, data.initAuth);

  if (data.initAuth) {
    // Opens the Google sign-in page in a popup, inside of an iframe in the
    // extension's offscreen document.
    // To centralize logic, all respones are forwarded to the parent frame,
    // which goes on to forward them to the extension's service worker.
    console.log(`Opening signInWithPopup`);

    signInWithPopup(auth, PROVIDER)
      .then(sendResponse)
      .catch(sendResponse)
  }
});

