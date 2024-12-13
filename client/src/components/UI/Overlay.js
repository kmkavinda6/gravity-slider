import React from "react"

// stylesheet
import Styles from './Overlay.module.css'

const displayStyles = {
    display: ''
}

const Overlay = ({ message, display }) => {
    if (display) {
        displayStyles.display = "flex"
    }
    else {
        displayStyles.display = "none"
    }

    return (
        <div style={{ display: displayStyles.display }}
            className={Styles.parent_wrapper}>
            
            <h1 className={Styles.overlay_text}>{message}</h1>
        </div>
    )
}

export default Overlay