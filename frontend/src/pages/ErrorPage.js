import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <div className='text-center pt-5'>
        <img src='https://i.pinimg.com/736x/4e/19/c2/4e19c2d8da38136202aa53345057f601.jpg'/>
        <br/>
        <Link to='/' className='btn btn-primary'>Home</Link>
    </div>
  )
}

export default ErrorPage