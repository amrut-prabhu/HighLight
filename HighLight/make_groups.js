function join_group() {
  console.log("WOW")
}

document.innerHTML += "<a href= 'localhost:3000/'" + document.getElementById('create_group').value + ">create group</a>";

function create_group() {
  alert("BC")
}

document.getElementById('create_submit_btn').addEventListener('click', createGroup,false);

function createGroup(event){
    event = event || window.event;
    var targetElement = event.target || event.srcElement;
    if (targetElement.className.match(/createGrp/)) {
        //an element with the "upvote" class was clicked

        sendTextURL(highlightedText);
    }
}

function sendTextURL(selectedText) {
  var currUrl = window.location.href;
  var response = getFromServer(HEROKU_APP + USERNAME_PARAMETER + user_id
    + SELECTED_TEXT_PARAMETER + selectedText + URL_POST_PARAMETER + currUrl);
}

function getFromServer(url) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, false);
  xhr.send();

  console.log(url);

  var result = xhr.responseText;
  console.log(result);
  return result;
}
