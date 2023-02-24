import { useState, useEffect } from "react";


// this component is created for rendering all 7 week days in header with correct day numbers and etc
export default function WeekItem(props) {

    //get date from index.js
    const d = props.d
    
    // get weekday (with condition that first week day - monday)
    let weekday = d.getDay() == 0 ? 6 : d.getDay()-1
    let firstDayOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekday); // Find the first day of the week
    let week_items = [] // week items. Array for collecting all days and rendering them in further in forEach cycle

    // main cycle proccess of creating correct week days and pushing them into week_items array
    for(let dayIndex = 0; dayIndex<7; dayIndex++) {
        let thisDay = new Date(firstDayOfWeek);
        thisDay.setDate(thisDay.getDate() + dayIndex);
        let dayShort = thisDay.toLocaleString('uk-UA', {weekday: 'short'}).toUpperCase()
        week_items.push(
            (<div>
                <span className="calendar-item-day">{dayShort}</span>
                <span className="calendar-item-number">{thisDay.getDate()}</span>
            </div>) )
    }

    //STATES 
    const [selectedDay, setCurrentDay] = useState(weekday);

    useEffect(() => {
        // calling function in index.js file for switching the selected day
      props.changeDay(selectedDay)
    })
    


    return (
        <div className="header-calendar">
            {week_items.map((d, i) => {
                return (
                        <div
                            className={
                                `calendar-item ${selectedDay == i && `selected-ci`} 
                                ${weekday == i && `today-ci`}
                                ${(i == 5 || i == 6) && `weekend-item`}`
                            } 
                            key={i} 
                            onClick={() => setCurrentDay(i)}>
                            {d.props.children}
                        </div>
                        )
            })}
        </div>
    )
}
            