import React, { useEffect, useState } from 'react'
import './Login&Register.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import Loader from '../components/Loader'

const Register = () => {

    const [user, setUser] = useState({ name: "", email: "", username: "", password: "" }); // State to manage user input for registration
    const [loading, setLoading] = useState(false); // State to manage loading state
    const navigate = useNavigate(); // Hook to navigate to different routes

    useEffect(() => {
        // Check if the user is already logged in
        if (localStorage.getItem("token") && localStorage.getItem("user")) {
            navigate('/');
            toast.success("You are already logged in!");
        }
    }, []);

    const handleForm = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send POST request to register endpoint with user data
            const result = await axios.post(`${process.env.REACT_APP_API_AUTH}/register`, user);
            setLoading(false);
            toast.success(result.data.message);
            navigate('/login'); // Redirect to login page after successful registration
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message); // Show error toast with message from server response
        }
    }

    return (
        <div className=' d-flex justify-content-center align-items-center' style={{ height: "100vh" }}>
            <div style={{ height: "650px", width: "1000px", borderRadius: "25px" }} className='row shadow-lg login-row'>
                <div className='col-md-6 poster-image'></div>
                <div className='col-md-6 my-auto p-4 register-css'>
                    <form onSubmit={(e) => handleForm(e)}>
                        <h1>Register</h1>
                        <div className="form-floating mb-3 mt-4">
                            <input type="text" className="form-control" id="floatingInputName" placeholder="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                            <label for="floatingInputName">Full Name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="floatingInputEmail" placeholder="name@example.com" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                            <label for="floatingInputEmail">Email</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="floatingInputUsername" placeholder="username" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />
                            <label for="floatingInputUsername">Username</label>
                        </div>
                        <div className="form-floating">
                            <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
                            <label for="floatingPassword">Password</label>
                        </div>
                        <button className='btn btn-dark mt-3' type='submit'>{loading ? <Loader /> : 'Register'}</button>
                    </form>
                    <p className='mt-4 text-secondary'>Don't have an account? <Link to='/login'>Login here</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Register