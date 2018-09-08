/*
  ========================================
  Constants
  ========================================
*/
const HEROKU_APP = "https://fbhackbackend.herokuapp.com";
const URL_GET_PARAMETER = "/sendHighlights?url=";
const USERNAME_PARAMETER = "/getText?username=";
const SELECTED_TEXT_PARAMETER = "&selectedText=";
const URL_POST_PARAMETER = "&url=";

var testUserName = "test";

/*
  ========================================
  Function Calls
  ========================================
*/

getTextsToHighlight();

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
    if (selectedText) {
        console.log("Selected: " + selectedText);
        var currUrl = window.location.href;
        var response = getFromServer(HEROKU_APP + USERNAME_PARAMETER + testUserName
            + SELECTED_TEXT_PARAMETER + selectedText + URL_POST_PARAMETER + currUrl);
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
function getIntensityColour(intensity) {
    return "yellow";
}

/**
 * {@param String} text Text to be highlighted
 * {@param Integer} intensity Intensity of the highlight
 */
function highlight(text, intensity) {
    let isCaseSensitive = true;
    let isBackwards = false;
    let isWrapAround = true;

    if (window.find(text, isCaseSensitive, isBackwards, isWrapAround)) {
        console.log("Text highlighted");
    }
    else {
        console.log("===Text to highlight not found: " + text);
    }
    document.execCommand("HiliteColor", false, getIntensityColour(intensity));
    window.getSelection().removeAllRanges();
}

/**
 * {@param Array} textObjects Array of objects. Each object is {text: ... , intensity: ...}. Intensity should be [1,5].
 */
function highlightTexts(textObjects) {
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
 * API request to get the text to highlight on the current webpage
 */
function getTextsToHighlight() {
    var currUrl = window.location.href;
    var response = getFromServer(HEROKU_APP + URL_GET_PARAMETER + currUrl);

    var textObjects = JSON.parse(response);
    highlightTexts(textObjects);
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
