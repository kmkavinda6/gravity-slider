import React from "react"

const NumberSystem = () => {
    return (
        <>
            <span style={{
                position: 'absolute',
                color: 'white',
                fontSize: '70px',
                top: -45,
                right: -5
            }}>+</span>

            <span style={{
                position: 'absolute',
                color: 'white',
                fontSize: '80px',
                bottom: -40,
                right: 0
            }}>-</span>
        </>
    )
}

export default NumberSystem