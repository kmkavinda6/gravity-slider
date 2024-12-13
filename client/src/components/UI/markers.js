import React from "react"

// stylesheets
import Styles from './Markers.module.css'

const Markers = () => {
    return (
        <div>
            <div className=
                {`${Styles.marker} 
                ${Styles.marker_1}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_1h}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_2}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_2h}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_3}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_3h}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_4}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_4h}`}></div>

            <div className=
                {`${Styles.marker} 
                ${Styles.marker_5}`}></div>
        </div>
    )
}

export default Markers