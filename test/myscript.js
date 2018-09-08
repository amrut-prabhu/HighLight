var time_zones = document.getElementsByClassName("_2ZHKfmUi");
var start_time = Number(time_zones[0].innerHTML.substr(0, 2));
var end_time = Number(time_zones[time_zones.length - 1].innerHTML.substr(0, 2));
var width_of_one_hour = (100.00 / time_zones.length);

var day = [];
var last_lesson;

var days = document.getElementsByClassName("_1ovwrDKS");

for(var i = 0; i < days.length; i++) {
  var my_day = [];
  var rows = days[i].getElementsByClassName("uWKhgSIP");
  for(var j = 0; j < rows.length; j++) {
    var current_row = rows[j].childNodes;
    var prev_time = start_time;
    for(var k = 0; k < current_row.length; k++) {
      var lesson = current_row[k];
      var lesson_descript = lesson.innerText;
      var lesson_time = lesson.attributes.style.nodeValue.split('(');
      var lesson_start_time = Number(lesson_time[1].split('%')[0])/width_of_one_hour + prev_time;
      var duration = Number(lesson_time[2].split('%')[0])/width_of_one_hour;

      prev_time = lesson_start_time + duration;
      console.log(lesson_start_time);
      console.log(duration);
      console.log(lesson_descript);

      var lesson_info = {'button': lesson, 'start_time': lesson_start_time, 'end_time': lesson_start_time + duration};
      my_day.push(lesson_info);
      last_lesson = lesson;
    }
    console.log("ROW ENDS");
  }
  console.log("DAY ENDS");
  day.push(my_day);
}
console.log(day);

// add divs / buttons.
// remove divs / buttons.
var button_info = last_lesson;
var tmp = last_lesson.className.split('-');
console.log(tmp[1]);
tmp[1] = "6";
console.log(tmp[1]);
var new_tmp = tmp[0] + '-' + tmp[1];
button_info.className = new_tmp;
var new_lesson = {'button': button_info, 'start_time': 12, 'end_time':14};
day[4].push(new_lesson);
day[5].pop();

console.log(day);

//update time_zones.
var min_time = 24, max_time = 0;
for(var i = 0; i < day.length; i++) {
  for(var j = 0; j < day[i].length; j++) {
    min_time = Math.min(min_time, day[i][j].start_time);
    max_time = Math.max(max_time, day[i][j].end_time);
  }
}

console.log(min_time);
console.log(max_time);

function make_time(x) {
  if(x < 10)  return "0" + x;
  else        return x;
}

var len = time_zones.length - 1;

while(len--) time_zones[0].remove();

time_zones[0].innerText = make_time(min_time);
for(var x = min_time; x <= max_time; x++) {
  var tmp = time_zones[0].cloneNode(true);
  tmp.innerText = make_time(x);
  time_zones[0].parentNode.appendChild(tmp);
}
time_zones[0].remove();
var span_child = time_zones[0].parentNode.childNodes[0];
time_zones[0].parentNode.removeChild(time_zones[0].parentNode.childNodes[0]);
time_zones[0].parentNode.appendChild(span_child);

var new_width = 100 / (max_time - min_time + 1);

for(var i = 0; i < day.length; i++) {
  var current_day = day[i];
  current_day.sort(function(a, b) {
    return a.start_time > b.start_time;
  });
  var prop_current_day = days[i].getElementsByClassName("_1QLpCN58")[0];

  var tmp = prop_current_day.attributes.style.nodeValue.split(' ');
  var tmp2 = tmp[1].split('%');
  var new_tmp2 = new_width*2 + '%'
  tmp = tmp[0] + ' ' + new_tmp2 + ' ' + tmp[2];
  prop_current_day.attributes.style.nodeValue = tmp;

  var rows = days[i].getElementsByClassName("uWKhgSIP");
}
