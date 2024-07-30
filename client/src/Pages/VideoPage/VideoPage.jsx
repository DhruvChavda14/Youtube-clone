import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Comments from "../../Components/Comments/Comments";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import LikeWatchLaterSaveBtns from "./LikeWatchLaterSaveBtns";
import "./VideoPage.css";
import { addToHistory } from "../../actions/History";
import { viewVideo } from "../../actions/video";
import {  watchVideo } from "../../actions/watchActions";
import PopupNotification from "./PopupNotification.jsx";

function VideoPage() {
  const { vid } = useParams();
  //console.log(vid)
  const vids = useSelector(s => s.videoReducer)
  const vv = vids?.data.filter(
    (q) => q._id === vid
  )[0]
  
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state?.currentUserReducer);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [historyAdded, setHistoryAdded] = useState(false); // Track if history is added
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0); // Track touch start time
  const [touchArea, setTouchArea] = useState("");

  console.log(CurrentUser.result._id)

  useEffect(() => {
    const fetchData = async () => {
      if (CurrentUser && !historyAdded) {
        try {
          dispatch(addToHistory({ videoId: vid, Viewer: CurrentUser.result._id }));
          setHistoryAdded(true);

          dispatch(viewVideo({ id: vid }));


        const response = await dispatch(watchVideo(vid, CurrentUser.result._id));
  
          if (response && response.pointsAdded !== undefined) {
            setPointsEarned(response.pointsAdded);
          } else {
            console.error("Invalid response structure:", response);
          }
        } catch (error) {
          console.error("Error in VideoPage useEffect:", error);
        }
      }
    };

    fetchData();
  }, [dispatch, vid, CurrentUser, historyAdded]);

  
  const moreVideos = vids?.data?.filter((video) => video._id !== vid);
  //console.log(moreVideos)

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const handleSingleClick = (e) => {
    if (!e || !e.target) return;
    const videoPlayerRect = videoRef.current.getBoundingClientRect();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    console.log("Single click detected:", clickX, clickY);

    
    const topRightAreaWidth = 300;
    const topRightAreaHeight = 200;

    
    const isInTopRightCorner =
      clickX >= videoPlayerRect.width - topRightAreaWidth &&
      clickY <= topRightAreaHeight;

    if (isInTopRightCorner) {
      console.log("Click within top-right corner area");
      setShowPopup(true);
    } else {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleDoubleClick = debounce((e) => {
    e.preventDefault();
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const clickX = e.clientX;
    const videoWidth = videoElement.clientWidth;

    if (clickX > videoWidth / 2) {
      
      videoElement.currentTime += 10;
    } else {
      
      videoElement.currentTime -= 10;
    }
  });
  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleTripleClick = debounce((e) => {
    e.preventDefault();
    const clickX = e.clientX;
    const videoWidth = videoRef.current.clientWidth;
    const middleRegionWidth = 100; 

    const leftBoundary = (videoWidth / 2) - (middleRegionWidth / 2);
    const rightBoundary = (videoWidth / 2) + (middleRegionWidth / 2);

    if (clickX > rightBoundary) {
      
      const confirmed = window.confirm("Are you sure you want to leave this page and go to Google?");
      if (confirmed) {
        window.location.href = 'https://www.google.com';
      }
    } else if (clickX < leftBoundary) {
      
      console.log("Going to comments");
      document.querySelector('.comments_VideoPage').scrollIntoView({ behavior: 'smooth' });
    } else {
      
      const firstMoreVideo = moreVideos[0];
      console.log(firstMoreVideo);
      if (firstMoreVideo) {
        videoRef.current.src = `http://localhost:5500/${firstMoreVideo.filePath}`;
        videoRef.current.play();
      }
    }
  }, 300);

  const handleMultipleClick = (e) => {
    e.preventDefault();

    if (e.detail === 1) {
      handleSingleClick(e);
    } else if (e.detail === 2) {
      handleDoubleClick(e);
    } else if (e.detail === 3) {
      handleTripleClick(e);
    }
  };
  const handleLongPress = (direction) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (direction === "right") {
      
      videoElement.playbackRate = 2.0;
    } else if (direction === "left") {
      videoElement.playbackRate = 0.5;
    }
  };

  const handleMouseUp = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.playbackRate = 1.0;
  };

  const handleLongPressStart = (area) => {
    setTouchStartTime(Date.now()); 
    setTouchArea(area); 
  };

  const handleLongPressEnd = () => {
    const touchDuration = Date.now() - touchStartTime;

    if (touchDuration >= 500) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (touchArea === "right") {
      
        videoElement.playbackRate = 2.0;
      } else if (touchArea === "left") {
      
        videoElement.playbackRate = 0.5;
      }
    } else {
      
      handleSingleClick();
    }
  };





  return (
    <div className="container_videoPage">
      <div className="container2_videoPage">
        <div className="video_display_screen_videoPage">
          <video
            ref={videoRef}
            src={`http://localhost:5500/${vv?.filePath}`}
            className="video_ShowVideo_videoPage"
            controls
            onMouseDown={(e) => {
              const rect = e.target.getBoundingClientRect();
              const clickX = e.clientX - rect.left;

              if (clickX > rect.width / 2) {
                
                handleLongPress("right");
              } else {
                
                handleLongPress("left");
              }
            }}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => {
              const rect = e.target.getBoundingClientRect();
              const touchX = e.touches[0].clientX - rect.left;

              if (touchX > rect.width / 2) {
                
                handleLongPressStart("right");
              } else {
                
                handleLongPressStart("left");
              }
            }}
            onTouchEnd={handleLongPressEnd}
            onClick={handleMultipleClick}
            onContextMenu={(e) => e.preventDefault()}
          ></video>
          {showPopup && <PopupNotification onClose={handlePopupClose} />}
          <div className="video_details_videoPage">
            <div className="video_btns_title_VideoPage_cont">
              <p className="video_title_VideoPage">{vv?.videoTitle}</p>
              <div className="views_date_btns_VideoPage">
                <div className="views_videoPage">
                  {vv?.Views} views <div className="dot"></div>{" "}
                  {moment(vv?.createdAt).fromNow()}
                </div>
                <LikeWatchLaterSaveBtns vv={vv} vid={vid} />
              </div>
            </div>
            <Link
              to={`/chanel/${vv?.videoChanel}`}
              className="chanel_details_videoPage"
            >
              <b className="chanel_logo_videoPage">
                <p>{vv?.Uploder.charAt(0).toUpperCase()}</p>
              </b>
              <p className="chanel_name_videoPage">{vv?.Uploder}</p>
            </Link>
            <div className="comments_VideoPage">
              <h2>
                <u>Comments</u>
              </h2>
              <Comments videoId={vv._id} />
            </div>
          </div>
        </div>
        <div className="moreVideoBar">
          <h2>More Videos</h2>
          {
            moreVideos?.map((video) => (
              <div key={video._id} className="moreVideoItem">
                <Link to={`/video/${video._id}`} className="moreVideoLink">
                  <video src={`http://localhost:5500/${video.filePath}`} className="moreVideoThumbnail" />
                </Link>
                  <div className="moreVideoInfo">
                    <p className="moreVideoTitle">{video.videoTitle}</p>
                    <pre className="moreVideoViews">
                      {video.Views} views <div className="dot"></div> {moment(video.createdAt).fromNow()}
                    </pre>
                  </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
export default VideoPage;