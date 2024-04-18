import { faArrowRightFromBracket, faCalendar, faCalendarDay, faHome, faLocationDot, faUser, faEllipsisVertical, faRetweet, faHeart as SolidHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { faComment, faHeart } from '@fortawesome/free-regular-svg-icons'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button'
import Loader from '../components/Loader'

const ProfileDetails = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState();
  const [userData, setUserData] = useState();
  const [userTweets, setUserTweets] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [edit, setEdit] = useState({ name: "", location: "", dob: null });
  const [commentTweetId, setCommentTweetId] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showImg, setShowImg] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [image, setImage] = useState(null);

  // Function to handle closing comment modal
  const handleCloseComment = () => {
    setShowComment(false);
    setComment('');
    setCommentTweetId(null);
  }

  // Function to handle showing comment modal
  const handleShowComment = () => setShowComment(true);

  // Function to handle showing image upload modal
  const handleShowImg = () => setShowImg(true);

  // Function to handle closing image upload modal
  const handleCloseImg = () => {
    setShowImg(false);
    setImage(null);
  }

  // Function to handle showing edit profile modal
  const handleShowEdit = () => {
    setShowEdit(true);
    editInfo();
  }

  // Function to handle closing edit profile modal
  const handleCloseEdit = () => {
    setShowEdit(false);
    setEdit("");
  };

  // Function to fetch user data and update state
  useEffect(() => {
    fetchDataAndUpdateState();
  }, [navigate, userTweets]);

  const fetchDataAndUpdateState = async () => {
    // Fetch user data from local storage
    const storedUser = localStorage.getItem("user");

    // Redirect to login if user is not logged in
    if (!localStorage.getItem("token") || !storedUser) {
      navigate('/login');
      toast.error("Login to access profile!");
      return; // Exit early if user is not logged in
    }

    // Parse user data from local storage
    const parsedUser = JSON.parse(storedUser);
    setLoggedInUser(parsedUser);

    // Fetch user data from the server
    const user = await axios.get(`${process.env.REACT_APP_API_USER}/${parsedUser?._id}`);
    setUserData(user.data.user);

    // Fetch user tweets from the server
    const tweets = await axios.get(`${process.env.REACT_APP_API_USER}/${parsedUser._id}/tweets`);
    const newTweets = tweets.data.sortTweets;
    setUserTweets(newTweets);

    // Fetch all users data from the server
    const allUser = await axios.get(`${process.env.REACT_APP_API_USER}`);
    setAllUsers(allUser.data.allUsers);

  };

  // Function to populate edit profile form with user data
  const editInfo = () => {
    const newEdit = {
      name: userData.name,
      location: userData.location
    };

    const dob = userData?.dob;
    const date = dob ? new Date(dob) : null;
    const offset = date ? date.getTimezoneOffset() * 60000 : null; // Offset in milliseconds
    const localDate = date ? new Date(date.getTime() - offset) : null;
    const formattedDob = localDate ? localDate.toISOString().split('T')[0] : null;

    newEdit.dob = formattedDob;

    setEdit(newEdit);
  }

  // Request configuration with authorization header
  const reqConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }

  // Function to handle user logout
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("User Logged Out Successfully!");
    navigate('/login');
  }

  // Function to delete a tweet
  const deleteTweet = async (tweetId) => {
    try {
      const deletingTweet = await axios.delete(`${process.env.REACT_APP_API_TWEET}/${tweetId}`, reqConfig);
      toast.success(deletingTweet.data.message);

      // After successfully deleting the tweet, fetch updated data
      const updatedTweets = await axios.get(`${process.env.REACT_APP_API_USER}/${loggedInUser._id}/tweets`);
      setUserTweets(updatedTweets.data.findTweets);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Function to handle like and dislike a tweet
  const handleLike = async (tweetId) => {
    try {
      const findTweet = userTweets.find((item) => item._id === tweetId);
      const Likes = findTweet.likes;

      // Check if the logged-in user has already liked the tweet
      const findLikes = Likes.includes(loggedInUser._id);

      if (findLikes) {
        // If liked, perform dislike logic
        const dislike = await axios.put(
          `${process.env.REACT_APP_API_TWEET}/${tweetId}/dislike`,
          {},
          reqConfig
        );
        const updatedTweets = await axios.get(`${process.env.REACT_APP_API_USER}/${loggedInUser._id}/tweets`);
        setUserTweets(updatedTweets.data.findTweets);
      } if (!findLikes) {
        // If not liked, perform like logic
        const like = await axios.put(
          `${process.env.REACT_APP_API_TWEET}/${tweetId}/like`,
          {},
          reqConfig
        );

        fetchDataAndUpdateState()
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Function to handle retweet
  const handleRetweet = async (tweetId) => {
    try {
      const retweet = await axios.post(`${process.env.REACT_APP_API_TWEET}/${tweetId}/retweet`, {}, reqConfig);
      toast.success(retweet.data.message);

      fetchDataAndUpdateState()
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  // Function to handle adding a comment to a tweet
  const handleComment = async () => {
    setCommentLoading(true);

    try {
      const reply = await axios.post(`${process.env.REACT_APP_API_TWEET}/${commentTweetId}/reply`, { content: comment }, reqConfig);
      setCommentLoading(false);
      toast.success(reply.data.message);
      const updatedTweets = await axios.get(`${process.env.REACT_APP_API_USER}/${loggedInUser._id}/tweets`);
      setUserTweets(updatedTweets.data.findTweets);
    } catch (error) {
      setCommentLoading(false);
      toast.error(error.response.data.message);
    }

    handleCloseComment();
  }

  const today = new Date().toISOString().split('T')[0];

  // Function to handle editing profile information
  const editChanges = async () => {
    try {
      if (!edit.name || !edit.location || !edit.dob) {
        toast.error("All fields are mandatory!");
      }
      if (edit.name && edit.location && edit.dob) {
        const update = await axios.put(`${process.env.REACT_APP_API_USER}/${userData._id}`, { name: edit.name, location: edit.location, dob: edit.dob }, reqConfig);
        toast.success(update.data.message);
        handleCloseEdit();
        fetchDataAndUpdateState();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  // Function to handle uploading profile picture
  const uploadImg = async () => {
    if (!image) {
      toast.error("Picture is required!");
    }
    setImgLoading(true);

    try {
      const uploadImage = await axios.put(`${process.env.REACT_APP_API_USER}/${userData._id}/uploadProfilePic`, { image: image }, reqConfig);
      setImgLoading(false);
      toast.success(uploadImage.data.message);
      handleCloseImg();
      fetchDataAndUpdateState();
    } catch (error) {
      toast.error(error.response.data.message);
      setImgLoading(false);
      handleCloseImg();
    }
  }

  // Function to handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to navigate to tweet page
  const tweetPage = (id) => {
    navigate(`/tweet/${id}`)
  }

  return (
    <div className='d-flex justify-content-center mx-auto'>
      {/* Sidebar */}
      <div style={{ height: "100vh", width: "270px", padding: "0px 10px" }} className='d-flex flex-column border  sticky-top'>
        <img src='https://cdn-icons-png.flaticon.com/512/3447/3447513.png' width="50px" height="50px" className='mt-3 ms-2' />
        <h5 className='mt-4 p-2'>
          <Link to='/' className='text-decoration-none text-dark'>
            <FontAwesomeIcon icon={faHome} className='pe-2 fs-4' />Home
          </Link>
        </h5>
        <h5 className='mt-2 p-2' style={{ backgroundColor: "#ADD8E6", borderRadius: "25px" }}>
          <Link to='/profile' className='text-decoration-none text-dark'>
            <FontAwesomeIcon icon={faUser} className='pe-3 fs-4' />Profile
          </Link>
        </h5>
        <h5 className='mt-2 p-2' style={{ cursor: "pointer" }} onClick={() => handleLogOut()}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} className='pe-3 fs-4' />Log Out
        </h5>
        <div className='mt-auto row mx-auto'>
          <div className='col-md-2 col-sm-12 text-center'>
            <FontAwesomeIcon icon={faUser} className='bg-secondary p-3' style={{ borderRadius: "25px" }} />
          </div>
          <div className='col ms-3'>
            <span>{loggedInUser?.name}</span>
            <p>{loggedInUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='border' style={{ width: "600px" }}>
        <div className='row mt-2'>
          <h5 className='ps-3'>Profile</h5>
        </div>
        <div style={{ height: "150px", backgroundColor: "#1DA1F2" }} className='container'></div>
        <div >
          <img src={userData?.profileImg ? userData.profileImg : 'https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg'} alt={userData?.name} height="100px" width="100px" style={{ borderRadius: "50%", objectFit: "cover", marginTop: "-50px" }} className='ms-4' />
          <button className='btn btn-outline-dark ms-2 float-end mt-2 me-2' onClick={handleShowEdit}>Edit</button>
          <button className='btn btn-outline-primary float-end mt-2' onClick={handleShowImg}>Update Profile Photo</button>
        </div>

        <div className='ps-3 mt-1'>
          <h5>{userData?.name}</h5>
          <p className='text-secondary'>@{userData?.username}</p>
          <div className='row'>
            <div className='col-md-6'>
              <p className='text-secondary'><FontAwesomeIcon icon={faCalendarDay} className='text-dark me-2' />Dob: {userData?.dob ? new Date(userData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
              <p className='text-secondary'><FontAwesomeIcon icon={faCalendar} className='text-dark me-2' />Joined on {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            </div>
            <div className='col-md-6'>
              <p className='text-secondary'><FontAwesomeIcon icon={faLocationDot} className='text-dark me-2' />Location: {userData?.location?userData.location:"N/A"}</p>
            </div>
          </div>
          <span className='text-dark fw-bold'>{userData?.following.length} Following</span>
          <span className='text-dark fw-bold ms-4'>{userData?.followers.length} Followers</span>
          <h5 className='text-center mt-3'>Tweets and Replies</h5>


          {userTweets?.map((tweet) => {

            // Format createdAt date to display as "Month Name Day, Year"
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const createdAtDate = new Date(tweet.createdAt).toLocaleDateString('en-US', options);

            return (
              <div key={tweet._id} className='row mt-4 ms-1 me-1 pt-2 pb-2 border' style={{ cursor: "pointer" }}>
                {tweet.retweetBy.length != 0 ? (<>
                  <div className='row'>
                    <span className='text-secondary ps-5'><FontAwesomeIcon icon={faRetweet} className='me-2' />
                      Retweeted By{' '}
                      {tweet.retweetBy.map((userId, index) => {
                        const retweetedUserData = allUsers.find(user => user._id === userId);

                        return (
                          <span key={userId}>
                            {retweetedUserData && retweetedUserData.username}
                            {index < tweet.retweetBy.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </>) : ''}

                <div className='col-1'>
                  {userData.profileImg === null ?
                    <img src='https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg' width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />
                    : <img src={userData.profileImg} width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />}

                </div>
                <div className='col mt-1 content-tweet'>

                  <span className='fw-bold'>@{userData.username}</span>
                  <span className='fw-bold ms-2 text-secondary'>. {createdAtDate}</span>
                  {userData._id == loggedInUser._id ?
                    <span className='float-end'>
                      <div className="dropdown" style={{ marginTop: "-6px" }}>
                        <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => deleteTweet(tweet._id)}>Delete</a></li>
                        </ul>
                      </div>
                    </span>
                    : ''}
                  <div onClick={() => tweetPage(tweet._id)}>
                    <p>{tweet.content}</p>
                    {tweet.image === null ? '' : <img src={tweet.image} width='500px' height='300px' style={{ objectFit: "cover" }} />}

                    <span className='ms-3'>
                      {tweet.likes.includes(loggedInUser._id) ? (
                        <>
                          <FontAwesomeIcon
                            icon={SolidHeart}
                            className='me-1 text-danger'
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleLike(tweet._id)}
                          />
                          {tweet.likes.length}
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faHeart}
                            className='me-1'
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleLike(tweet._id)}
                          />
                          {tweet.likes.length}
                        </>
                      )}
                    </span>

                    <span className='ms-4'><FontAwesomeIcon icon={faComment} className='me-1' onClick={() => { setCommentTweetId(tweet._id); handleShowComment() }} style={{ cursor: "pointer" }} />{tweet.replies.length}</span>
                    <span className='ms-4'>
                      {tweet.retweetBy.includes(loggedInUser._id) ?
                        (<><FontAwesomeIcon icon={faRetweet} className='me-1 text-success' onClick={() => handleRetweet(tweet._id)} style={{ cursor: "pointer" }} />{tweet.retweetBy.length}</>)
                        :
                        (<><FontAwesomeIcon icon={faRetweet} className='me-1' onClick={() => handleRetweet(tweet._id)} style={{ cursor: "pointer" }} />{tweet.retweetBy.length}</>)
                      }
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      </div>
      {/* Comment Modal */}
      <Modal show={showComment} onHide={handleCloseComment}>
        <Modal.Header closeButton>
          <Modal.Title>Tweet Your Reply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea className='form-control' style={{ height: "100px" }} placeholder='Write Your Reply' value={comment}
            onChange={(e) => setComment(e.target.value)}></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseComment}>
            Close
          </Button>
          <Button variant="primary" onClick={handleComment}>
            {commentLoading ? <Loader /> : 'Reply'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal show={showEdit} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Name</h5>
          <input type='text' value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className='form-control' />
          <h5 className='mt-3'>Location</h5>
          <input type='text' value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} className='form-control' />
          <h5 className='mt-3'>Date of Birth</h5>
          <input type='date' value={edit.dob} onChange={(e) => setEdit({ ...edit, dob: e.target.value })} className='form-control' max={today} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={editChanges}>
            {editLoading ? <Loader /> : 'Edit'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Profile Photo Modal */}
      <Modal show={showImg} onHide={handleCloseImg}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Profile Pic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='bg-info p-3 pb-1 rounded'>
            <p>Note: The image should be square in shape</p>
          </div>
          <input type='file' className='mt-2 form-control' accept='.jpg,.png,.jpeg' onChange={handleImageChange} />
          {image && <img src={image} alt='Image preview' style={{ maxWidth: '100%', marginTop: '10px' }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImg}>
            Close
          </Button>
          <Button variant="primary" onClick={uploadImg}>
            {imgLoading ? <Loader /> : 'Edit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ProfileDetails