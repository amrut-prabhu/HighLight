/*
  ========================================
  Constants
  ========================================
*/

// Request constants
const HEROKU_APP = "https://fbhackbackend.herokuapp.com";
const URL_GET_PARAMETER = "/sendHighlights?url=";
const USERNAME_PARAMETER = "/getText?username=";
const SELECTED_TEXT_PARAMETER = "&selectedText=";
const URL_POST_PARAMETER = "&url=";

// Highlight constants
const NORMALISATION_VALUE = 25;
const HIGHLIGHT_COLORS = ["#F7F7B9", "#FFFF3D", "#FCC691", "#FA8C1E", "#F76363"];

const selectedTextSet = new Set();

var testUserName = "test";

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

/**
 * Sends the selected text to the server .
 */
function sendSelectionText() {
    var selectedText = getSelectedText();

    if (selectedText && !selectedTextSet.has(selectedText)) {
        console.log("Selected: " + selectedText);
        selectedTextSet.add(selectedText);

        var currUrl = window.location.href;
        // var response = getFromServer(HEROKU_APP + USERNAME_PARAMETER + testUserName
        //     + SELECTED_TEXT_PARAMETER + selectedText + URL_POST_PARAMETER + currUrl);
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
 * {@param String} intensityColor Colour to highlight selected text with
 */
function addTooltip(intensityColor) {
  var selection = window.getSelection().getRangeAt(0).cloneContents();
  var span = document.createElement('span');
  span.appendChild(selection);

  var tooltip = '<span class="tooltiptext">  👍   👎   </span>'
  var wrappedselection = '<span class="tooltip" style="background-color:' + intensityColor + ';">' + span.innerHTML + tooltip + '</span>';

  document.execCommand('insertHTML', false, wrappedselection);
}

/**
 * {@param String} text Text to be highlighted
 * {@param Integer} intensity Intensity of the highlight
 */
function highlight(text, intensity) {
  let isCaseSensitive = true;
  let isBackwards = false;
  let isWrapAround = true;
  let intensityColor  = getIntensityColor(intensity);

  if (window.find(text, isCaseSensitive, isBackwards, isWrapAround)) {
    console.log("Text found");
  } else {
    console.log("===Text to highlight not found: " + text);
    return ;
  }

  document.execCommand("HiliteColor", false, intensityColor);

  text = text.substr(1, text.length - 2);
  window.find(text, isCaseSensitive, isBackwards, isWrapAround);

  addTooltip(intensityColor);

  // Clean up
  window.getSelection().removeAllRanges();
}

/**
 * {@param Array} textObjects Array of objects. Each object is {text: ... , intensity: ...}. Intensity should be [1,5].
 */
function highlightTexts() {
  var textObjects = getTextsToHighlight();

  // Allow modifications to webpage
  document.designMode = "on";

  for (var i = 0; i < textObjects.length; i++) {
    highlight(textObjects[i].text, textObjects[i].intensity);
  }

  // Clean up
  document.designMode = "off";
  scroll(0,0);
}

/**
 * {@return} Texts to highlight on the current webpage.
 */
function getTextsToHighlight() {
    var xhr = new XMLHttpRequest();
    var currUrl = window.location.href;
    var response = getFromServer(HEROKU_APP + URL_GET_PARAMETER + currUrl);
    var textObjects = JSON.parse(response);

    return textObjects;
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

    var result = xhr.responseText;
    console.log(result);
    return result;
}
