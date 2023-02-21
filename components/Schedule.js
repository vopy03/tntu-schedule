import { useState } from "react"
import ScheduleItem from "./ScheduleItem"
import axios from 'axios'


export default function  Schedule(props) {
    const [isCurrent, setIsCurrent] = useState(false)

    //get date 
    const d = new Date()
    
    let weekday = d.getDay() == 0 ? 6 : d.getDay()-1
    let firstDayOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekday); // Find the first day of the week
    let dayLong = d.toLocaleString('uk-UA', {weekday: 'long'})

    let items = []
    axios.get("/api/schedule?url=https://tntu.edu.ua/?p=uk/schedule&s=fis-sbs32").then((res) => {
        let data = res.data

        console.log(data)

        // for(let i = 0; i<data.le; dayIndex++) {
        //     items.push(
        //         (<div>
        //             <span className="calendar-item-day">{dayShort}</span>
        //             <span className="calendar-item-number">{thisDay.getDate()}</span>
        //         </div>) )
        // }
        data.forEach(s => {
            console.log(s[dayLong])
        });
        
    })
    

    

    return (
        <ul className='schedule-list'>
            {/* {items.map((subject, i) => {
                return (
                    {subject.props.children}
                )
            })} */}
            <ScheduleItem/>
            <ScheduleItem/>
            <ScheduleItem/>
        </ul>
    )
}