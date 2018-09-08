getTextsToHighlight();

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

    console.log("Found = " + window.find(text, isCaseSensitive, isBackwards, isWrapAround));
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
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      var textObjects = JSON.parse(this.responseText);
      highlightTexts(textObjects);
    }
    xmlhttp.open("GET", "https://fbhackbackend.herokuapp.com/sendHighlights?url=" + currUrl, false);
    xmlhttp.send();
}

/**
 * API request to get the text to highlight on the current webpage
 */
function sendSelectedText(username, selectedText) {
    var xhr = new XMLHttpRequest();
    var currUrl = window.location.href;

    xhr.open("GET", "https://fbhackbackend.herokuapp.com/getText?username=" + username + "&selectedText=" + selectedText + "&url=" + currUrl, false);
    xhr.send();

    var result = xhr.responseText;
    console.log(result);
}

