 chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(localStorage["user_id"] == undefined) {
      localStorage["user_id"] = Math.floor(Math.random() * 100000)
      sendUsername(localstorage["user_id"]);
    }
    console.log(localStorage)
    sendResponse({user_id: localStorage.user_id});
});

function sendUsername(user_id) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", "https://highlight007.herokuapp.com/createUser?username=" + user_id, false);
  xhr.send();

  console.log(url);

  var result = xhr.responseText;
  console.log(result);
  return result;
}


