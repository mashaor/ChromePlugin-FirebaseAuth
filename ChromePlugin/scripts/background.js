// background.js
const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

async function hasDocument() {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
      return true;
    }
    return false;
}

// A global promise to avoid concurrency issues
let creating;

async function setupOffscreenDocument(path) {
  // If we do not have a document, we are already setup and can skip
  if (await hasDocument()) {
    return;
  }

  // create offscreen document
  if (creating) {
        await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [
        chrome.offscreen.Reason.DOM_SCRAPING
      ],
        justification: 'authentication'
      });
    await creating;
    creating = null;
  }
}

function getAuth() {
  return new Promise(async (resolve, reject) => {
    const auth = await chrome.runtime.sendMessage({
      type: 'firebase-auth',
      target: 'offscreen'
    });
    auth?.name !== 'FirebaseError' ? resolve(auth) : reject(auth);
  })
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

async function firebaseAuth() {

  console.log('firebaseAuth() method');

  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const auth = await getAuth()
    .then((auth) => {
      console.log('User Authenticated');
      return auth;
    })
    .catch(err => {
      closeOffscreenDocument();
      if (err.code === 'auth/operation-not-allowed') {
        console.error('You must enable an OAuth provider in the Firebase' +
                      ' console in order to use signInWithPopup. This sample' +
                      ' uses SAML by default.');
      }else if (err.code === 'auth/popup-closed-by-user') {
        console.log("Popup closed by user");
      }else {
        console.error(err);
        return err;
      }
    })

  return auth;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'firebaseAuth') {
    console.log('firebaseAuth message recieved');
    firebaseAuth().then(user => sendResponse({ user })).catch(error => sendResponse({ error }));
    return true;  // Indicates that the response will be sent asynchronously
  }
  else if (request.action === 'tokenReady') {
    closeOffscreenDocument();
  }
});
