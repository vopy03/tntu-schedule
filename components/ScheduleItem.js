import { useState } from "react"


export default function ScheduleItem(props) {
    const [isCurrent, setIsCurrent] = useState(false)

    return (
        <li className='schedule-item'>
                <div className='timeline'>
                  <span className='timeline-time'>
                    <span className='timeline-time-start'>8:00</span><br></br>
                    <span className='timeline-time-end'>9:20</span>
                  </span>
                  <span className={`material-icons-outlined ${ isCurrent ? `` : 'small-timeline-icon'} }`}>{ isCurrent ? `radio_button_checked` : `radio_button_unchecked`}</span>
                </div>
                <div className='schedule-subject'>

                  <div className='subject-box'>
                    <h3 className='subject-box-title'>Веб-технології</h3>
                    <p className='subject-box-bottom-line'>
                      <span className='subject-type'>
                        <span className='material-icons-outlined'>note_alt</span>
                        <span>Лабораторна</span>
                      </span>
                      <span className='subject-venue'>
                        <span className='material-icons-outlined'>language</span>
                        <span>Онлайн</span>
                      </span>
                    </p>
                  </div>
                </div>
              </li>
    )
}