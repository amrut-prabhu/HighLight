/*
  ========================================
  Constants
  ========================================
  */
// Request constants
const HEROKU_APP = "https://highlight007.herokuapp.com";
const URL_GET_PARAMETER = "/sendHighlights?url=";
const USERNAME_PARAMETER = "/getText?username=";
const SELECTED_TEXT_PARAMETER = "&selectedText=";
const URL_POST_PARAMETER = "&url=";
const isCaseSensitive = true;
const isBackwards = false;
const isWrapAround = true;

// Highlight constants
const NORMALISATION_VALUE = 0.34;
const HIGHLIGHT_COLORS = ["#fffdc6", "#fffa79", "#f7ff21"];

const selectedTextSet = new Set();

var user_id = 1;

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  user_id = response.user_id;
});

/*
  ========================================
  Function Calls
  ========================================
  */

// Adds highlights to important text when the webpage is loaded
highlightTexts();

// EVent handler
document.onmouseup = sendSelectionText;

/*
  ========================================
  Sending Selected Text functions
  ========================================
  */

/**
 * Returns the text that is currently selected on the webpage.
 */
function getSelectedText() {
  var text = "";
  if (typeof window.getSelection != "undefined") {
    text = window.getSelection().toString();
  } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
    text = document.selection.createRange().text;
  }
  return text;
}

function sendTextURL(selectedText) {
  var currUrl = window.location.href;
  var response = getFromServer(HEROKU_APP + USERNAME_PARAMETER + user_id
    + SELECTED_TEXT_PARAMETER + selectedText + URL_POST_PARAMETER + currUrl);
}

/**
 * Sends the selected text to the server .
 */
function sendSelectionText() {
  var selectedText = getSelectedText();

  if (selectedText && !selectedTextSet.has(selectedText) && window.find(selectedText, isCaseSensitive, isBackwards, isWrapAround) && selectedText.length > 2) {
    console.log("Selected: " + selectedText);
    selectedTextSet.add(selectedText);

    sendTextURL(selectedText)
    // response == "200 OK"
  }
}


/*
  ========================================
  Highlighting Text functions
  ========================================
  */

/**
 * {@param Integer} intensity Intensity of the highlight
 * {@return String} String representing a Hexadecimal colour value
 */
function getIntensityColor(intensity) {
  var intensityLevel = Math.floor(intensity / NORMALISATION_VALUE);
  return HIGHLIGHT_COLORS[intensityLevel];
}

/**
 * Adds a floating tooltip to the text that is highlighted.
 *
 * {@param String} text
 * {@param String} intensityColor Colour to highlight selected text with
 * {@param Integer} matches
 */
function addTooltip(text, intensityColor, matches, friends) {
  var selection = window.getSelection().getRangeAt(0).cloneContents();
  var span = document.createElement('span');
  span.appendChild(selection);

  var upvoteBtn = ' <button class="upvote" text="' + text + '">👍</button> '
  var downvoteBtn = ' <button class="downvote" text="' + text + '">👎</button> '

  var tooltip = '<span class="tooltiptext"> ' + upvoteBtn +  downvoteBtn + matches + '😃';
  if (friends > 0)
    tooltip = tooltip + ' &nbsp; ' + friends + '👫';
  tooltip = tooltip + '</span>';
  var wrappedselection = '<span class="tooltip" style="background-color:' + intensityColor + ';">' + span.innerHTML + tooltip + '</span>';

  document.execCommand('insertHTML', false, wrappedselection);
}

/**
 * {@param String} text Text to be highlighted
 * {@param Integer} intensity Intensity of the highlight
 * {@param Integer} matches Number of times the text has been selected
 */
function highlight(text, intensity, matches, friends) {
  let intensityColor  = (friends > 0 ? "#a5c6ff" : getIntensityColor(intensity));

  if (window.find(text, isCaseSensitive, isBackwards, isWrapAround)) {
    console.log("Text found");
  } else {
    console.log("===Text to highlight not found: " + text);
    return ;
  }

  document.execCommand("HiliteColor", false, intensityColor);

  let trimmedText = text.substr(1, text.length - 2);
  window.find(trimmedText, isCaseSensitive, isBackwards, isWrapAround);

  addTooltip(text, intensityColor, matches, friends);

  // Clean up
  window.getSelection().removeAllRanges();
}

/**
 * {@return} Texts to highlight on the current webpage.
 */
function getTextsToHighlight() {
  var xhr = new XMLHttpRequest();
  var currUrl = window.location.href;
  var response = getFromServer(HEROKU_APP + URL_GET_PARAMETER + currUrl + "&username=" + user_id);
  var textObjects = JSON.parse(response);

  return textObjects;
}

/**
 * {@param Array} textObjects Array of objects. Each object is {text: ... , intensity: ...}. Intensity should be [1,5].
 */
function highlightTexts() {
  try {
    var textObjects = getTextsToHighlight();

    // Allow modifications to webpage
    document.designMode = "on";
    for (var i = 0; i < textObjects.length; i++) {
      highlight(textObjects[i].text, textObjects[i].intensity, textObjects[i].matches, textObjects[i].friendMatches);
    }
  } catch (err) {
    console.log("===" + err.message);
    document.designMode = "off";
  }

  // Clean up
  document.designMode = "off";
  scroll(0,0);
}

/*
  ========================================
  API calls to Heroku server
  ========================================
  */

/**
 * {@param String} url URL to which the request is to be sent.
 * {@return String} Returns response from server
 */
function getFromServer(url) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, false);
  xhr.send();

  console.log(url);

  var result = xhr.responseText;
  console.log(result);
  return result;
}

/*
  ========================================
  Tooltip button listeners
  ========================================
  */

document.body.addEventListener('click', upvoteHandler,false);

function upvoteHandler(event){
    event = event || window.event;
    var targetElement = event.target || event.srcElement;
    if (targetElement.className.match(/upvote/)) {
        //an element with the "upvote" class was clicked
        var highlightedText = targetElement.getAttribute("text");
        sendTextURL(highlightedText);
    }
}
