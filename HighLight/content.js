// Test URL:
// https://www.google.com.sg/search?rlz=1C1CHWA_enAE610AE610&ei=JJ6TW5XMLcr6vASbwo2gDg&q=chrome+extension+development&oq=ch&gs_l=psy-ab.3.0.35i39k1l2j0i67k1j0i20i263k1j0i131k1l2j0i20i263k1j0i131k1l2j0.102472.102632.0.103697.2.2.0.0.0.0.57.108.2.2.0....0...1c.1.64.psy-ab..0.2.107....0.EalnqmHrA8w

var textObjects = [];

var textObj1 = {
    text: " with - HTML, CSS, and ",
    intensity: 1
}
var textObj2 = {
    text: "chrome://extensio",
    intensity: 2
}
var textObj3 = {
    text: "ery Chrome API but canno",
    intensity: 3
}
var textObj4 = {
    text: "create a Chrome extension",
    intensity: 4
}
var textObj5 = {
    text: "customize an extension.",
    intensity: 5
}

textObjects.push(textObj1);
textObjects.push(textObj2);
textObjects.push(textObj3);
textObjects.push(textObj4);
textObjects.push(textObj5);

highlightTexts(textObjects);

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
 * {@param Integer} intensity Intensity of the highlight
 * {@return String} String representing a Hexadecimal colour value
 */
function getIntensityColour(intensity) {
    return "yellow";
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
