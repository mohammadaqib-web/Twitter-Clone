import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faEllipsisVertical, faHome, faImage, faRetweet, faUser, faHeart as SolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faComment, faHeart } from '@fortawesome/free-regular-svg-icons'
import axios from 'axios'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Loader from '../components/Loader'

const HomePage = () => {
  const navigate = useNavigate();
  const [allTweets, setAllTweets] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState();
  const [usersData, setUsersData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [tweetContent, setTweetContent] = useState('');
  const [tweetImage, setTweetImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [commentTweetId, setCommentTweetId] = useState(null);

  // Close the comment modal
  const handleCloseComment = () => {
    setShowComment(false);
    setComment('');
    setCommentTweetId(null);
  }

  // Show the comment modal
  const handleShowComment = () => setShowComment(true);

  // Close the tweet modal
  const handleClose = () => {
    setShow(false);
    setTweetContent('');
    setTweetImage(null);
  };

  // Show the tweet modal
  const handleShow = () => setShow(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!localStorage.getItem("token") || !storedUser) {
      navigate('/login');
      toast.error("Login to access homepage!");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);
    }

    fetchData();
  }, [navigate]);

  // Fetch tweets and related data
  const fetchData = async () => {
    try {
      const tweetResponse = await axios.get(`${process.env.REACT_APP_API_TWEET}`);
      const tweets = tweetResponse.data.sortTweets;

      const userIds = tweets.map((item) => item.tweetedBy);

      const usersDataArray = [];

      for (const userId of userIds) {
        const findUserResponse = await axios.get(`${process.env.REACT_APP_API_USER}/${userId}`);
        const userData = findUserResponse.data;
        usersDataArray.push(userData.user);
      }

      const allUser = await axios.get(`${process.env.REACT_APP_API_USER}`);
      setAllUsers(allUser.data.allUsers);

      setUsersData(usersDataArray);
      setAllTweets(tweets);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Request configuration with JWT token
  const reqConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }

  // Handle tweet creation
  const handleTweet = async () => {
    setLoading(true)
    try {
      const createTweetResponse = await axios.post(
        `${process.env.REACT_APP_API_TWEET}`,
        { content: tweetContent, image: tweetImage },
        reqConfig
      );
      setLoading(false);
      toast.success(createTweetResponse.data.message);
      fetchData();
    }
    catch (error) {
      setLoading(false);
      toast.error(error.response ? error.response.data.message : "An error occurred");
    }

    handleClose();
  }

  // Handle image selection for tweet
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTweetImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle like/unlike functionality for tweets
  const handleLike = async (tweetId) => {
    try {
      const findTweet = allTweets.find((item) => item._id === tweetId);
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
        fetchData();
      } if (!findLikes) {
        // If not liked, perform like logic
        const like = await axios.put(
          `${process.env.REACT_APP_API_TWEET}/${tweetId}/like`,
          {},
          reqConfig
        );
        fetchData();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Handle retweet functionality
  const handleRetweet = async (tweetId) => {
    try {
      const retweet = await axios.post(`${process.env.REACT_APP_API_TWEET}/${tweetId}/retweet`, {}, reqConfig);
      toast.success(retweet.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  // Handle comment creation
  const handleComment = async () => {
    setCommentLoading(true);

    try {
      const reply = await axios.post(`${process.env.REACT_APP_API_TWEET}/${commentTweetId}/reply`, { content: comment }, reqConfig);
      setCommentLoading(false);
      toast.success(reply.data.message);
      fetchData();
    } catch (error) {
      setCommentLoading(false);
      toast.error(error.response.data.message);
    }

    handleCloseComment();
  }

  // Handle user logout
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("User Logged Out Successfully!");
    navigate('/login');
  }

  // Handle tweet deletion
  const deleteTweet = async (tweetId) => {
    try {
      const deletingTweet = await axios.delete(`${process.env.REACT_APP_API_TWEET}/${tweetId}`, reqConfig);
      toast.success(deletingTweet.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  // Navigate to tweet page
  const tweetPage = (id) => {
    navigate(`/tweet/${id}`)
  }

  return (
    <div className='d-flex justify-content-center mx-auto container'>
      {/* Sidebar */}
      <div style={{ height: "100vh", width: "270px", padding: "0px 10px" }} className='d-flex flex-column border  sticky-top sidebar'>
        <img src='https://cdn-icons-png.flaticon.com/512/3447/3447513.png' width="50px" height="50px" className='mt-3 ms-2' />
        <h5 className='mt-4 p-2' style={{ backgroundColor: "#ADD8E6", borderRadius: "25px" }}>
          <Link to='/' className='text-decoration-none text-dark'>
            <FontAwesomeIcon icon={faHome} className='pe-2 fs-4' />Home
          </Link>
        </h5>
        <h5 className='mt-2 p-2'>
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
      <div className='border tweet-side' style={{ width: "600px" }}>
        <div className='row  mt-2 container-fluid'>
          <div className='col'>
            <h5 className='ps-3'>Home</h5>
          </div>
          <div className='col-2'><button className='btn btn-primary' onClick={handleShow}>Tweet</button></div>
        </div>
        {allTweets.map((tweet) => {

          // Find the corresponding user data for the current tweet
          const userData = usersData.find((user) => user._id === tweet.tweetedBy);

          // Format createdAt date to display as "Month Name Day, Year"
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          const createdAtDate = new Date(tweet.createdAt).toLocaleDateString('en-US', options);

          return (
            <div key={tweet._id} className='row mt-4 ms-1 me-1 pt-2 pb-2 border' style={{ cursor: "pointer" }}>
              {tweet.retweetBy.length != 0 ? (<>
                <div className='row'>
                  <span className='text-secondary ps-5'><FontAwesomeIcon icon={faRetweet} className='me-2' />
                    Retweeted By
                    {tweet.retweetBy.map((userId, index) => {
                      const retweetedUserData = allUsers.find(user => user._id === userId);

                      return (
                        <span key={userId} className='ms-1'>
                          {retweetedUserData && retweetedUserData.username}
                          {index < tweet.retweetBy.length - 1 && ','}
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
              <div className='col-md-11 col-sm-11 mt-1 content-tweet'>

                <Link className='fw-bold text-dark text-decoration-none' to={`/profile/${userData._id}`}>@{userData.username}</Link>
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
                  {tweet.image === null ? '' : <img src={tweet.image} width='500px' height='300px' style={{ objectFit: "cover" }} className='sm-img'/>}

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

      {/*Tweet Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Tweet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea className='form-control' style={{ height: "100px" }} placeholder='Write Your Tweet' value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}></textarea>
          <input type='file' accept='.jpg,.png,.jpeg' onChange={handleImageChange} className='mt-2' style={{ position: "absolute", paddingRight: "-10px", opacity: "0" }} />
          <FontAwesomeIcon icon={faImage} className='fs-2 mt-2' />
          {tweetImage && <img src={tweetImage} alt='Tweet Preview' style={{ maxWidth: '100%', marginTop: '10px' }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleTweet}>
            {loading ? <Loader /> : 'Tweet'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/*Comment Modal */}
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

    </div>

  );
}

export default HomePage;
