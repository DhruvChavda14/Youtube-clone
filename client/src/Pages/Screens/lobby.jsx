import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../Providers/Socket";
import './lobby.css'
const LobbyScreen = () => {
    const [room, setRoom] = useState("");

    const socket = useSocket();
    const navigate = useNavigate();

    
    const email = useSelector((state) => state.currentUserReducer?.result.email);
    console.log("Email : ",email)
    const handleSubmitForm = useCallback(
        (e) => {
            e.preventDefault();
            socket.emit("room:join", { email, room });
        },
        [email, room, socket]
    );

    const handleJoinRoom = useCallback(
        (data) => {
            const { room } = data;
            navigate(`/room/${room}`);
        },
        [navigate]
    );

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    return (
        <div className="lobby-container">
            <h1>Lobby</h1>
            <form className="form-group" onSubmit={handleSubmitForm}>
                <label className="lobby-label" htmlFor="room">Room Number</label>
                <input
                    type="text"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="lobby-input"
                />
                <br />
                <button className="join-button">Join</button>
            </form>
        </div>
    );
};

export default LobbyScreen;