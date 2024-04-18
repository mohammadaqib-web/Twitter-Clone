import React, { useEffect, useState } from 'react'
import './Login&Register.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import axios from 'axios';

const Login = () => {

    const [user, setUser] = useState({ email: "", password: "" }); // State to manage user input for email and password
    const [loading, setLoading] = useState(false); // State to manage loading state
    const navigate = useNavigate(); // Hook to navigate to different routes

    useEffect(() => {
        // Check if the user is already logged in
        if (localStorage.getItem("token") && localStorage.getItem("user")) {
            navigate('/'); // Redirect to home page if already logged in
            toast.success("You are already logged in!"); // Show success toast
        }
    }, []);

    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send POST request to login endpoint with user data
            const result = await axios.post(`${process.env.REACT_APP_API_AUTH}/login`, user);
            toast.success(result.data.message);
            localStorage.setItem("token", result.data.token); // Store JWT token in local storage
            localStorage.setItem("user", JSON.stringify(result.data.user)); // Store user data in local storage
            setLoading(false);
            navigate('/'); // Redirect to home page
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message); // Show error toast with message from server response
        }
    }

    return (
        <div className=' d-flex justify-content-center align-items-center' style={{ height: "100vh" }}>
            <div className='row shadow-lg login-row'>
                <div className='col-md-6 poster-image'></div>
                <div className='col-md-6 my-auto p-4 form-css'>
                    <form onSubmit={(e) => submitForm(e)}>
                        <h1>Log in</h1>
                        <div className="form-floating mb-3 mt-4">
                            <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                            <label for="floatingInput">Email</label>
                        </div>
                        <div className="form-floating">
                            <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
                            <label for="floatingPassword">Password</label>
                        </div>
                        <button className='btn btn-dark mt-3' type='submit'>{loading ? <Loader /> : 'LogIn'}</button>
                    </form>
                    <p className='mt-4 text-secondary'>Have an account? <Link to='/register'>Register here</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Login