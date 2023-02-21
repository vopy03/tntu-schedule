import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import WeekItem from '@/components/Header/WeekItem'
import HButtons from '@/components/Header/HButtons'
import Schedule from '@/components/Schedule'
// import gicons from '@/styles/gicons.css'

const inter = Inter({ subsets: ['latin'] })

const d = new Date();
const weekday_text = d.toLocaleString('uk-UA', {weekday: 'long'})
const dateMonth = d.toLocaleString('uk-UA', {day: 'numeric', month: 'long',})

export default function Home() {

  return (
    <>
      <Head>
        <title>TNTU Schedule</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* <Script src="js/app.js"/> */}
    
      </Head>
      <header>
        <div className="header-container">
            <h3 className="logo">TNTU Schedule</h3>
            <div className="header-today">
                <p id="today-text"><b>{weekday_text}</b>, {dateMonth}</p>
            </div>
            <WeekItem d={d} />
            <div className='header-space'></div>
            <HButtons />
        </div>
    </header>
    <main>
        <div className="wrap">
            <div className="schedule">
            {/* <span class="material-icons-outlined">radio_button_checked</span> */}

            <Schedule />

            </div>
        </div>
    </main>
    </>
  )
}
