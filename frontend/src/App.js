import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileDetails from './pages/ProfileDetails';
import OthersProfile from './pages/OthersProfile';
import TweetDetail from './pages/TweetDetail';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <div>
      {/* Router setup */}
      <Router>
        <Routes>
          {/* Route for Home page */}
          <Route path='/' element={<HomePage/>}/>
          {/* Route for Login page */}
          <Route path='/login' element={<Login/>}/>
          {/* Route for Register page */}
          <Route path='/register' element={<Register/>}/>
          {/* Route for Profile details page */}
          <Route path='/profile' element={<ProfileDetails/>}/>
          {/* Route for Other users' profile page */}
          <Route path='/profile/:id' element={<OthersProfile/>}/>
          {/* Route for Tweet detail page */}
          <Route path='/tweet/:id' element={<TweetDetail/>}/>
          {/* Route for Error page (404) */}
          <Route path='/*' element={<ErrorPage/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
