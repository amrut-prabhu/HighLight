var sat = document.getElementsByClassName("_1ovwrDKS");
if(sat.length >= 6) {
  sat[5].parentElement.removeChild(sat[5]);
}
var elems = document.getElementsByClassName("uWKhgSIP")[5];
var time_zones = document.getElementsByClassName("_2ZHKfmUi").length;
console.log(time_zones);
var title = 'CS2040C', heading = 'LAB TA', venue = 'COM1-PL5';
var val = (100.00 / time_zones) * 2;
var but1 = '<button class="_19INDIda color-6 DWCn28tZ" style="margin-left: calc(0% + 1px); width: calc(' + val + '% - 1px);"><div class="_3SYch_q7"><div class="_3EsPRJwo">' + title + '</div><div>' + heading + '</div><div>' + venue + '</div></div></button>';
elems.insertAdjacentHTML('beforeend', but1); 
