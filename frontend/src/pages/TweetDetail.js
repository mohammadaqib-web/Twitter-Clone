import { faArrowRightFromBracket, faHome, faRetweet, faUser, faHeart as SolidHeart, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { faComment, faHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Loader from '../components/Loader'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const TweetDetail = () => {

    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState();
    const [tweetDetails, setTweetDetails] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [userData, setUserData] = useState();
    const params = useParams();
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState('');
    const [commentTweetId, setCommentTweetId] = useState(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [tweetReplies, setTweetReplies] = useState([]);
    const [tweetRepliesOwner, setTweetRepliesOwner] = useState([]);

    // Fetch data when component mounts or params.id changes
    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem("user");

        if (!localStorage.getItem("token") || !storedUser) {
            // If not logged in, redirect to login page
            navigate('/login');
            toast.error("Login to access Tweets!");
        } else {
            // If logged in, set user data and fetch tweet details
            const parsedUser = JSON.parse(storedUser);
            setLoggedInUser(parsedUser);
            fetchData();
        }
    }, [params.id]) // Dependency array should include params.id, so useEffect triggers when the id changes

    // Function to close the comment modal
    const handleCloseComment = () => {
        setShowComment(false);
        setComment('');
        setCommentTweetId(null);
    }

    // Function to show the comment modal
    const handleShowComment = () => setShowComment(true);

    // Function to fetch tweet details and related data
    const fetchData = async () => {
        try {
            // Fetch tweet details
            const tweet = await axios.get(`${process.env.REACT_APP_API_TWEET}/${params.id}`);
            const tweetData = tweet.data.findTweet;
            // Set tweet details if found
            setTweetDetails(tweetData);


            if (tweet.data.findTweet.replies) {
                // Fetch details for each reply
                const fetchedReplies = [];
                for (const reply of tweet.data.findTweet.replies) {
                    const replyTweet = await axios.get(`${process.env.REACT_APP_API_TWEET}/${reply.tweetId}`);
                    fetchedReplies.push(replyTweet.data.findTweet);
                }
                setTweetReplies(fetchedReplies);


                const fetchedRepliesOwner = [];
                for (const owner of fetchedReplies) {
                    const replyTweetOwner = await axios.get(`${process.env.REACT_APP_API_USER}/${owner.tweetedBy}`);
                    fetchedRepliesOwner.push(replyTweetOwner.data.user);
                }
                setTweetRepliesOwner(fetchedRepliesOwner);
            }

            // Fetch user data of the tweet author
            const user = await axios.get(`${process.env.REACT_APP_API_USER}/${tweet.data.findTweet.tweetedBy}`);
            setUserData(user.data.user);

            // Fetch all users
            const allUser = await axios.get(`${process.env.REACT_APP_API_USER}`);
            setAllUsers(allUser.data.allUsers);
        } catch (error) {
            // Handle errors
            toast.error(error.response.data.message);
            navigate('/')
        }
    }

    // Format createdAt date to display as "Month Name Day, Year"
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const createdAtDate = new Date(tweetDetails?.createdAt).toLocaleDateString('en-US', options);

    // Request configuration for authorized requests
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
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    // Function to delete a reply
    const deleteReply = async (tweetId) => {
        try {
            const deletingTweet = await axios.delete(`${process.env.REACT_APP_API_TWEET}/${tweetId}`, reqConfig);
            toast.success(deletingTweet.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    // Function to handle like/unlike action on a tweet or reply
    const handleLike = async (tweetId) => {
        try {
            const findTweet = tweetDetails;
            const Likes = findTweet.likes;

            // Check if the logged-in user has already liked the tweet
            const findLikes = Likes.includes(loggedInUser?._id);

            if (findLikes) {
                // If liked, perform dislike logic
                const dislike = await axios.put(
                    `${process.env.REACT_APP_API_TWEET}/${tweetId}/dislike`,
                    {},
                    reqConfig
                );
                fetchData();
            } else {
                // If not liked, perform like logic
                const like = await axios.put(
                    `${process.env.REACT_APP_API_TWEET}/${tweetId}/like`,
                    {},
                    reqConfig
                );
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while processing your request.');
        }
    };

    // Function to handle commenting on a tweet or reply
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

    // Function to handle retweeting a tweet or reply
    const handleRetweet = async (tweetId) => {
        try {
            const retweet = await axios.post(`${process.env.REACT_APP_API_TWEET}/${tweetId}/retweet`, {}, reqConfig);
            toast.success(retweet.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    return (
        <div className='d-flex justify-content-center mx-auto'>
            {/* Sidebar */}
            <div style={{ height: "100vh", width: "270px", padding: "0px 10px" }} className='d-flex flex-column border  sticky-top'>
                <img src='https://cdn-icons-png.flaticon.com/512/3447/3447513.png' alt='logo' width="50px" height="50px" className='mt-3 ms-2' />
                <h5 className='mt-4 p-2'>
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

            {/* Tweet details */}
            <div className='border' style={{ width: "600px" }}>
                <div className='row  mt-2'>
                    <div className='col'>
                        <h5 className='ps-3'>Tweet</h5>
                    </div>
                </div>

                <div className='row mt-4 ms-1 me-1 pt-2 pb-2 border'>
                    {tweetDetails?.retweetBy?.length !== 0 ? (
                        <>
                            <div className='row'>
                                <span className='text-secondary ps-5'><FontAwesomeIcon icon={faRetweet} className='me-2' />
                                    Retweeted By
                                    {tweetDetails?.retweetBy?.map((userId, index) => {
                                        const retweetedUserData = allUsers.find(user => user?._id === userId);

                                        return (
                                            <span key={userId} className='ms-1'>
                                                {retweetedUserData && retweetedUserData.username}
                                                {index < tweetDetails.retweetBy.length - 1 && ', '}
                                            </span>
                                        );
                                    })}
                                </span>
                            </div>
                        </>
                    ) : ''}

                    <div className='col-1'>
                        {userData?.profileImg === null ?
                            <img src='https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg' width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />
                            : <img src={userData?.profileImg} width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />}
                    </div>

                    <div className='col mt-1 content-tweet'>
                        <Link className='fw-bold text-dark text-decoration-none' to={`/profile/${userData?._id}`}>@{userData?.username}</Link>
                        <span className='fw-bold ms-2 text-secondary'>. {createdAtDate}</span>
                        {userData?._id == loggedInUser?._id ?
                            <span className='float-end'>
                                <div className="dropdown" style={{ marginTop: "-6px" }}>
                                    <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <FontAwesomeIcon icon={faEllipsisVertical} />
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#" onClick={() => deleteTweet(tweetDetails?._id)}>Delete</a></li>
                                    </ul>
                                </div>
                            </span>
                            : ''}
                        <p>{tweetDetails.content}</p>
                        {tweetDetails.image === null ? '' : <img src={tweetDetails.image} width='500px' height='300px' style={{ objectFit: "cover" }} />}

                        <span className='ms-3'>
                            {tweetDetails.likes?.includes(loggedInUser?._id) ? (
                                <>
                                    <FontAwesomeIcon
                                        icon={SolidHeart}
                                        className='me-1 text-danger'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleLike(tweetDetails?._id)}
                                    />
                                    {tweetDetails.likes?.length}
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        className='me-1'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleLike(tweetDetails?._id)}
                                    />
                                    {tweetDetails.likes?.length}
                                </>
                            )}
                        </span>

                        <span className='ms-4'><FontAwesomeIcon icon={faComment} className='me-1' onClick={() => { setCommentTweetId(tweetDetails?._id); handleShowComment() }} style={{ cursor: "pointer" }} />{tweetDetails.replies?.length}</span>
                        <span className='ms-4'>
                            {tweetDetails.retweetBy?.includes(loggedInUser?._id) ?
                                (<><FontAwesomeIcon icon={faRetweet} className='me-1 text-success' onClick={() => handleRetweet(tweetDetails?._id)} style={{ cursor: "pointer" }} />{tweetDetails.retweetBy?.length}</>)
                                :
                                (<><FontAwesomeIcon icon={faRetweet} className='me-1' onClick={() => handleRetweet(tweetDetails?._id)} style={{ cursor: "pointer" }} />{tweetDetails.retweetBy?.length}</>)
                            }
                        </span>
                    </div>
                </div>


                <h5 className='ps-3 pt-3'>Replies</h5>

                {/*Replies*/}
                {tweetReplies.map((reply, index) => (
                    <div className='row mt-4 ms-1 me-1 pt-2 pb-2 border'>

                        {reply?.retweetBy?.length !== 0 ? (
                            <>
                                <div className='row'>
                                    <span className='text-secondary ps-5'><FontAwesomeIcon icon={faRetweet} className='me-2' />
                                        Retweeted By
                                        {reply?.retweetBy?.map((userId, index) => {
                                            const retweetedUserData = allUsers.find(user => user?._id === userId);

                                            return (
                                                <span key={userId} className='ms-1'>
                                                    {retweetedUserData && retweetedUserData.username}
                                                    {index < reply.retweetBy.length - 1 && ','}
                                                </span>
                                            );
                                        })}
                                    </span>
                                </div>
                            </>
                        ) : ''}

                        <div key={index} className='d-flex'>
                            <div className='col-1'>
                                {tweetRepliesOwner[index]?.profileImg === null ?
                                    <img src='https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg' width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />
                                    : <img src={tweetRepliesOwner[index]?.profileImg} width='40px' height='40px' style={{ borderRadius: "25px", objectFit: 'cover' }} />}
                            </div>
                            <div className='col mt-1 content-tweet'>
                                <Link className='fw-bold text-dark text-decoration-none' to={`/profile/${tweetRepliesOwner[index]?._id}`}>@{tweetRepliesOwner[index]?.username}</Link>
                                <span className='fw-bold ms-2 text-secondary'>. {new Date(reply.createdAt).toLocaleDateString('en-US', options)}</span>
                                {tweetRepliesOwner[index]?._id == loggedInUser?._id ?
                                    <span className='float-end'>
                                        <div className="dropdown" style={{ marginTop: "-6px" }}>
                                            <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <FontAwesomeIcon icon={faEllipsisVertical} />
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li><a className="dropdown-item" href="#" onClick={() => deleteReply(reply?._id)}>Delete</a></li>
                                            </ul>
                                        </div>
                                    </span>
                                    : ''}
                                <p>{reply.content}</p>
                                {reply.image && <img src={reply.image} width='500px' height='300px' style={{ objectFit: "cover" }} />}
                                <span className='ms-3'>
                                    {reply.likes?.includes(loggedInUser?._id) ? (
                                        <>
                                            <FontAwesomeIcon
                                                icon={SolidHeart}
                                                className='me-1 text-danger'
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleLike(reply._id)}
                                            />
                                            {reply.likes?.length}
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className='me-1'
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleLike(reply._id)}
                                            />
                                            {reply.likes?.length}
                                        </>
                                    )}
                                </span>
                                <span className='ms-4'><FontAwesomeIcon icon={faComment} className='me-1' onClick={() => { setCommentTweetId(reply._id); handleShowComment() }} style={{ cursor: "pointer" }} />{reply.replies?.length}</span>
                                <span className='ms-4'>
                                    {reply.retweetBy?.includes(loggedInUser?._id) ?
                                        (<><FontAwesomeIcon icon={faRetweet} className='me-1 text-success' onClick={() => handleRetweet(reply._id)} style={{ cursor: "pointer" }} />{reply.retweetBy?.length}</>)
                                        :
                                        (<><FontAwesomeIcon icon={faRetweet} className='me-1' onClick={() => handleRetweet(reply._id)} style={{ cursor: "pointer" }} />{reply.retweetBy?.length}</>)
                                    }
                                </span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Comment modal */}
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
    )
}

export default TweetDetail
