

# Chrome Extension V3 With Firebase Authentication

## Content
- [Overview](#overview)
- [Firebase Auth](#Firebase-Auth-with-SAML-and-signInWithPopup)
- [Plugin Setup for Testing](#Plugin-Setup-and-Testing)
- [Links and References](#Links-and-References)


## Overview

This guide demonstrates how to use Firebase authentication in a Chrome extension, utilizing a SAML identity provider and the signInWithPopup method. Upon successful authentication, the access token is stored in Chrome's local storage and can be accessed later within the [content.js](ChromePlugin\scripts\content.js) script.

Features of the Plugin:

* Authenticates the user through a popup login form.
* Stores the API token securely in a local store. 

## Firebase Auth with SAML and signInWithPopup 

#### Prerequisites:
* Firebase application has been created in Firebase console
* SAML authentication was selected and configured for the application 


Some authentication methods, like `signInWithPopup`, aren't directly compatible with Chrome extensions due to restrictions imposed by Manifest V3, which disallows loading code from external sources outside the extension package. To overcome this limitation, a workaround involves embedding the authentication flow within an iframe using an offscreen document. This approach requires hosting a web page, which serves as the authentication endpoint. The code for this web page can be found in the `OffscreenAuthWebsite` folder.

#### `OffscreenAuthWebsite` File Structure:
* `signInWithPopup.js`: JavaScript code that handles authentication. 
* `firebaseConfig.js`: Firebase app configuration.
* `index.html`: HTML file to reference `signInWithPopup.js` script.

Before hosting the website, obtain app configuration from [Firebase Console](https://console.firebase.google.com):

- Select Project Overview from the left pane
- Select your app and click the settings button 
- Scroll down and fin the section that shows the config settings for the app
- Copy and paste them in to [firebaseConfig.js](OffscreenAuthWebsite/public/firebaseConfig.js) file.

It should look like this:

 ```
const firebaseConfig = {
  apiKey: "D345rdfdfgfdgf2yDcmqcQ",
  authDomain: "appid.firebaseapp.com",
  projectId: "appid",
  storageBucket: "appid.appspot.com",
  messagingSenderId: "1713453418579",
  appId: "1:1713453499:web:6ca435dgdfg2ec6",
  measurementId: "G-324WRGERT"
};

 ```

 - Obtain the SAML provider Id (should be similar to `saml.dev`) from Firebase console and update the value in [signInWithPopup.js](OffscreenAuthWebsite\public\signInWithPopup.js) script:

```
const PROVIDER = new SAMLAuthProvider("saml.dev");
```

Next, deploy the website in to hosting environment and copy the public facing URL. 

NOTE: Firebase offers a hosting environment. Follow these steps to deploy the offscreen website to Firebase:

- Open the project in the [Firebase Console](https://console.firebase.google.com).
- Click "Add App" under the the project name and choose "Web"
- Select "Set up Firebase Hosting" and follow the set up steps. The steps will include:
  -  Adding Firebase SDK to the project
  -  Installing Firebase CLI
  -  Deployment to Firebase Hosting:
 ```
>firebase login
>firebase deploy --only hosting:NAME_OF_YOUR_WEBSITE
 ```
Once the deployment is complete, obtain the URL of the newly deployed app and replace the URL in the [offscreen.js](ChromePlugin/scripts/offscreen.js) file (_URL variable).

### Configuration Changes in Firebase 

This extension is using SAML as authentication method and it considered to be "federated sign in", therefore we must add the Chrome extension ID and the authentication website url, to the list of authorized domains in Firebase console. 

- Open the project in the [Firebase Console](https://console.firebase.google.com).
- In the Authentication section, open the Settings page.
- Add a URIs of the extension and the website like the following to the list of Authorized Domains:

 ```
chrome-extension://CHROME_EXTENSION_ID
https://NAME_OF_YOUR_WEBSITE.web.app
 ```
## Plugin Setup for Testing

#### Prerequisites

* Google Chrome Browser
* Firebase Authentication setup

#### Configuration

* Clone the Repository
* Add the Extension to Chrome:
  - Open Chrome and navigate to chrome://extensions/.
  - Enable "Developer mode" by toggling the switch in the top-right corner.
  - Click "Load unpacked" and select the ChromePlugin directory (..\ChromePlugin-FirebaseAuth\ChromePlugin).
* Pin your extension to any page
* Test by clicking the "Login" button on the extension popup

Refer to the sample method in [content.js](ChromePlugin\scripts\content.js) for retrieving the stored access token from Chrome's local storage and checking whether it has expired.

#### `ChromePlugin` File Structure:

* `manifest.json`: Configuration file for the Chrome extension.
* `content.js`: Content script that captures user messages and sends them to the external API. It will pull the access token from the local Chrome store. 
* `popup.html`: HTML file for the extension's popup login form.
* `popup.js`: handles the login button click method and sends auth request to 'background.js'. Once authenticated, it stores the token in the local Chrome store. 
* `offscreen.js`: Acts as the proxy between the public website and the extension.
* `background.js`: Background script handles the communication (via messaging) between `offscreen.js` and `popup.js`.

### Links and References

[Chrome Extensions Tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)

[Firebase Auth in Chrome Extention](https://firebase.google.com/docs/auth/web/chrome-extension#use-web-extension)

[Firebase SAML](https://firebase.google.com/docs/auth/web/saml#web_4)