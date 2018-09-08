chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(localStorage["user_id"] == undefined)
      localStorage["user_id"] = Math.floor(Math.random() * 100000)
    console.log(localStorage)
    sendResponse({user_id: localStorage.user_id});
});

