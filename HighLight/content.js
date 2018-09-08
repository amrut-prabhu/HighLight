document.designMode = "on";

window.find(" with - HTML, CSS, and ", true, false, true);
document.execCommand("HiliteColor", false, "yellow");

window.find("chrome://extensio", true, false, true);
document.execCommand("HiliteColor", false, "yellow");

window.find("ery Chrome API but canno", true, false, true);
document.execCommand("HiliteColor", false, "yellow");

// scroll(0,0);
// window.scrollTo(0,0);
//$('html,body').scrollTop(0);
console.log(window.find("customize an extension.", true, false, true));
document.execCommand("HiliteColor", false, "#ed1b04");
window.getSelection().removeAllRanges();

document.designMode = "off";

// https://www.google.com.sg/search?q=chrome+extension+development&rlz=1C1CHWA_enAE610AE610&oq=chro&aqs=chrome.0.69i59j69i60j0j69i60j69i59j69i65.1195j0j7&sourceid=chrome&ie=UTF-8

/**
 * {@param String} text Text to be highlighted
 * {@param Integer} intensity Intensity of the highlight
 */
function highlight(text, intensity) {
    let isCaseSensitive = true;
    let isBackwards = false;
    let isWrapAround = true;

    console.log("Found = " + window.find("customize an extension.", isCaseSensitive, isBackwards, isWrapAround));
    document.execCommand("HiliteColor", false, getIntensityColour(intensity));
    window.getSelection().removeAllRanges();
}

/**
 * {@param Integer} intensity Intensity of the highlight
 * {@return String} String representing a Hexadecimal colour value
 */
function getIntensityColour(intensity) {
    return "#ed1b04";
}

/**
 * {@param Array} textObjects Array of objects. Each object is {text: ... , intensity: ...}. Intensity should be [1,5].
 */
function highlightTexts(textObjects) {
    // Allow modifications to webpage
    document.designMode = "on";

    for (var i = 0; i < textObjects.length(); i++) {
        highlight(textObject[i].text, textObject[i].intensity);
    }

    // Clean up
    document.designMode = "off";
    scroll(0,0);
}
