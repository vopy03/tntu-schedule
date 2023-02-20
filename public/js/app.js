const cal = document.getElementsByClassName("header-calendar")[0];
const cal_items = document.getElementsByClassName("calendar-item");
const cal_items_nums = document.getElementsByClassName("calendar-item-number");

const today_text = document.getElementById("today-text")

var d = new Date();
// var d = new Date(Date.now()+(86400000)*10); // for adding days manually

// Find the first day of the week
let weekday = d.getDay() == 0 ? 6 : d.getDay()-1
let firstDayOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekday); // Find the first day of the week


// -------  date actions like showing today day and month --------



  
// set day nums
for (let dayIndex=0; dayIndex <7 ; dayIndex++) {
  let thisDay = new Date(firstDayOfWeek);
  thisDay.setDate(thisDay.getDate() + dayIndex);
  // set day num
  cal_items_nums[dayIndex].innerHTML = thisDay.getDate()
}


// today-text inserting values
today_text.innerHTML = "<b>" + d.toLocaleString('uk-UA', {weekday: 'long'}) + "</b>, " 
                        + d.toLocaleString('uk-UA', {day: 'numeric', month: 'long',});



for (let dayIndex = 0; dayIndex < cal_items.length; dayIndex++) {
    // condition for Sunday
    if (d.getDay() == 0) {
        cal_items[6].classList.add("today-ci");
        cal_items[6].classList.add("selected-ci");
        break;
    }
    
    if (dayIndex == d.getDay()-1) {
        cal_items[dayIndex].classList.add("today-ci");
        cal_items[dayIndex].classList.add("selected-ci");
        
        break;
    }
    
}



// -------^ END --- date actions like showing today day and month --- END ^--------

cal.onclick = function(event) {
    var condition = false;
    var item = ''
    for(var b = 0; b < event.path.length;b++ ){
        if(event.path[b].classList.contains("calendar-item")) {
            condition = true;
            item = event.path[b];
            break;
        }
    }

    if (condition) {
        for(var i=0; i < cal_items.length; i++) {
            if (item==cal_items[i]) {
                showTabs(i);
                break;
            }
        }
    }
}


function hideTabs(a) {
    for (var i = a; i < cal_items.length; i++) {
        cal_items[i].classList.remove('selected-ci');
    }
}

function showTabs(b) {
        hideTabs(0);
        cal_items[b].classList.add('selected-ci');
}


// data processing

function getData(url,forse = false) {
    // if(localStorage.getItem('tntu_sched') != null || !forse ) { return JSON.parse(localStorage.getItem('tntu_sched')) }

    let sched = fetch("http://localhost:3000/api/schedule?url="+ url + "").then( res => {
        if(res.ok) {
            // localStorage.setItem('tntu_sched', res.json())
            return res.json()
        }
    } )

    // return sched
    console.log(sched);
}