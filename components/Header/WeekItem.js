import { useState, useEffect } from "react";

export default function WeekItem(props) {

    //get date 
    const d = props.d
    
    let weekday = d.getDay() == 0 ? 6 : d.getDay()-1
    let firstDayOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekday); // Find the first day of the week
    let cal_items = []

    for(let dayIndex = 0; dayIndex<7; dayIndex++) {
        let thisDay = new Date(firstDayOfWeek);
        thisDay.setDate(thisDay.getDate() + dayIndex);
        let dayShort = thisDay.toLocaleString('uk-UA', {weekday: 'short'}).toUpperCase()
        cal_items.push(
            (<div>
                <span className="calendar-item-day">{dayShort}</span>
                <span className="calendar-item-number">{thisDay.getDate()}</span>
            </div>) )
    }

    //STATES 
    const [selectedDay, setCurrentDay] = useState(weekday);

    useEffect(() => {
      props.changeDay(selectedDay)
    })
    


    return (
        <div className="header-calendar">
            {cal_items.map((d, i) => {
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
            