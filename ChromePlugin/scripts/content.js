// Example of how to extract token from local store
function getToken() {

  chrome.storage.local.get(["accessToken", "expirationTime"], function(data) {  

    const token = data.accessToken;
    var expirationTime = data.expirationTime;

    console.log("Token has been loaded from local storage: ", token);

    //Check if the access token is present or has expired
    const currentTime = Date.now();
    if (!token || currentTime >= expirationTime) {
      console.log("Token has expired");
    } 
 });
}
