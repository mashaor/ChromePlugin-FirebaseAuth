// popup.js


document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('loginButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "firebaseAuth" }, (response) => {
      if (response.user) {
        console.log('User signed in',response.user);
        
        //save accessToken to local store 
        chrome.storage.local.set(
          { 
            accessToken: response.user.user.stsTokenManager.accessToken,           
            expirationTime: response.user.user.stsTokenManager.expirationTime 
          }, function() {
           console.log('API token stored securely.');
           chrome.runtime.sendMessage({ action: "tokenReady" });
           loginButton.disabled = true; // Disable the button
           loginButton.innerText = 'All set'; // Change the button text
        });

      } else {
        console.error('Error during sign-in:', response.error);
      }
    });
  });
});