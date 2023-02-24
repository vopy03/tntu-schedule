import { useEffect, useState } from "react"
import ScheduleItem from "./ScheduleItem"
import axios from 'axios'



export default function  Schedule(props) {
    const [dayLong, setDayLong] = useState(props.dayLong)
    const [prevDayLong, setPrevSelectedDay] = useState(props.dayLong)
    const [scheduleList, setScheduleList] = useState([])
    const [data, setData] = useState(null)
    const [dd, setD] = useState(props.d)

    let d = new Date(Date.parse(dd))
    let weekday = d.getDay() == 0 ? 6 : d.getDay()-1
    let firstDayOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - weekday); // Find the first day of the week

    // // fixing weekday value for further conditions
    // d.setDate(firstDayOfWeek.getDate() + props.selectedDay-1)
    // weekday = d.getDay() == 0 ? 6 : d.getDay()-1

    // an array that will store ScheduleItem components
    let items = []

    let firstWeek = false
    useEffect(() => {
        setDayLong(props.dayLong)
        if(prevDayLong != dayLong) {
            setScheduleList([])
            d.setDate(firstDayOfWeek.getDate() + props.selectedDay)
            setD(d)
            setPrevSelectedDay(dayLong)
        }
    })

    if(data == null) {
        // condition for checking local storage
        if (typeof window !== "undefined") {
            
            if(localStorage.getItem("tntu-schedule") === null) {

                // getting data from inner API
                axios.get("/api/schedule?url=https://tntu.edu.ua/?p=uk/schedule&s=fis-sbs32")
                    .then((res) => {
                    setData(res.data)
                    localStorage.setItem("tntu-schedule", JSON.stringify(res.data))
                })
            } else setData(JSON.parse(localStorage.getItem("tntu-schedule")))
        }
    }
    
    
    if(data != null && scheduleList.length == 0) {
        // console.log(weekday +" | "+ dayLong)
        if( weekday != 5 && weekday != 6 ) {
            try{
            data.forEach(s => {
                const weekSelection = firstWeek ? "0" : "1"
                const subjectTime = s[""].split(' ')[1].split("-")

                let isCurrent = false;


                // is current ?
                let startDate = structuredClone(d);
                const startHour = subjectTime[0].split(':')[0]
                const startMinute = subjectTime[0].split(':')[1]
                startDate.setHours(startHour, startMinute, 0)
                let endDate = structuredClone(d);
                const endHour = subjectTime[1].split(':')[0]
                const endMinute = subjectTime[1].split(':')[1]
                endDate.setHours(endHour, endMinute, 0)
                if(props.d.valueOf() > startDate.valueOf() && props.d.valueOf() < endDate.valueOf()) isCurrent = true

                
                if(s[dayLong][weekSelection].toString().trim() !== "")  {
                    let splitted = s[dayLong][weekSelection].trim().split('  ').filter((w) => w != '')
                    const subjectName = splitted[0]
                    const sType = splitted[1].split(' ')[0]
                    const sVenue = splitted[1].split(' ')[1]

                    // console.log(subjectTime[0]+"-"+subjectTime[1] + " | " + subjectName + " | " + sType +" | "+ sVenue)
                    items.push(<ScheduleItem sTime={subjectTime} sName={subjectName} sType={sType} sVenue={sVenue} isCurrent={isCurrent}/>)
                }
                else {
                    if(s[dayLong].toString().trim() !== "")  {
                        let splitted = s[dayLong].toString().trim().split('  ').filter((w) => w != '')
                        const subjectName = splitted[0]
                        const sType = splitted[1].split(' ')[0]
                        const sVenue = splitted[1].split(' ')[1]

                        items.push(<ScheduleItem sTime={subjectTime} sName={subjectName} sType={sType} sVenue={sVenue} isCurrent={isCurrent}/>)

                        // console.log(subjectTime[0]+"-"+subjectTime[1] + " | " + subjectName + " | " + sType +" | "+ sVenue) 
                    }
                }

                
                    
            })

            setScheduleList(items);

            } catch(e) {}

        }

    }

    

    return (
        <div className='schedule-list'>
            {scheduleList.map((scheduleItem, i) => {
                return (
                    <div className='schedule-item' key={i}>
                    {scheduleItem}
                    </div>
                )
            })}
        </div>
    )
}