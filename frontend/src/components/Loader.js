import React from 'react'

const Loader = () => {
    return (
        <div className='container' style={{ height: "1.5rem" }}>
            <div className="spinner-border text-light" role="status" style={{ marginTop: "-3px" }}>
                <span className="visually-hidden">Loading....</span>
            </div>
        </div>
    )
}

export default Loader