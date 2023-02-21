import { useState } from "react"


export default function ScheduleItem(props) {

    return (
        <div className='schedule-item-container'>
          <div className='timeline'>
            <span className='timeline-time'>
              <span className='timeline-time-start'>{props.sTime[0]}</span><br></br>
              <span className='timeline-time-end'>{props.sTime[1]}</span>
            </span>
            <span className={`material-icons-outlined ${ props.isCurrent ? `` : 'small-timeline-icon'} }`}>{ props.isCurrent ? `radio_button_checked` : `radio_button_unchecked`}</span>
          </div>
          <div className='schedule-subject'>

            <div className={`subject-box ${ props.isCurrent ? `current-box` : ''}` }>
              <h3 className='subject-box-title'>{props.sName}</h3>
              <p className='subject-box-bottom-line'>
                <span className='subject-type'>
                  <span className='material-icons-outlined'>note_alt</span>
                  <span className='subject-type-text'>{props.sType}</span>
                </span>
                <span className='subject-venue'>
                  <span className='material-icons-outlined'>language</span>
                  <span>{props.sVenue == "ATutor" ? 'Онлайн' : props.sVenue}</span>
                </span>
              </p>
            </div>
          </div>
        </div>
    )
}