import React, {  useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DescribeChanel.css";
import { FaEdit, FaPhone, FaUpload } from "react-icons/fa"; 
import { fetchUserPoints } from "../../actions/watchActions";
import {  useNavigate } from "react-router-dom";




function DecribeChanel({ setEditCreateChanelBtn, Cid, setVidUploadPage }) {
  const chanels = useSelector((state) => state?.chanelReducers);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentChanel = chanels.find((c) => c._id === Cid);
  const currentUser = useSelector((state) => state?.currentUserReducer);
  const userPoints = useSelector((state) => state.pointsReducer.points);
  const loading = useSelector((state) => state.pointsReducer.loading);

  
  useEffect(() => {
    if (currentUser?.result?._id) {
      dispatch(fetchUserPoints(currentUser.result._id));
    }
  }, [dispatch, currentUser]);

  

  const handleVideoCallClick = () => {
    navigate("/lobby");
  };


  return (
    <div className="container3_chanel">
      <div className="chanel_logo_chanel">
        <b>{currentChanel?.name.charAt(0).toUpperCase()}</b>
      </div>
      <div className="description_chanel">
        <b> {currentChanel?.name} </b>
        <p> {currentChanel?.desc} </p>
        <div className="user_points">
          {loading ? <p>Loading points...</p> : <p>Points: {userPoints}</p>}
        </div>
      </div>
      {currentUser?.result._id === currentChanel?._id && (
        <>
          <p
            className="editbtn_chanel"
            onClick={() => {
              setEditCreateChanelBtn(true);
            }}
          >
            <FaEdit />
            <b> Edit Chanel</b>
          </p>
          <p className="uploadbtn_chanel" onClick={() => setVidUploadPage(true)}>
            <FaUpload />
            <b> Upload Video</b>
          </p>
          <p className="videocallbtn_chanel" onClick={handleVideoCallClick}>
            <FaPhone />
            <b> Video Call</b>
          </p>
        </>
      )}
    </div>
  );
}

export default DecribeChanel;

