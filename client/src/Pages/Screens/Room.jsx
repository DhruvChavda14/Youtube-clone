import React, { useEffect, useCallback, useState } from "react";
import peer from "../../Providers/Peer";
import { useSocket } from "../../Providers/Socket";
import './roomPage.css';

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [screenShare, setScreenShare] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [screenTrack, setScreenTrack] = useState(null);
    const [isCallEstablished, setIsCallEstablished] = useState(false);
    const [currentCallId, setCurrentCallId] = useState(null);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMyStream(stream);
            const offer = await peer.getOffer();
            const callId = Date.now().toString();
            console.log(`Initiating call with ID: ${callId}`); 
            setCurrentCallId(callId);
            socket.emit("user:call", { to: remoteSocketId, offer, callId });
        } catch (error) {
            console.error("Error handling call user:", error);
        }
    }, [remoteSocketId, socket, peer]);

    const handleIncomingCall = useCallback(async ({ from, offer, callId }) => {
        try {
            setRemoteSocketId(from);
            setCurrentCallId(callId); 
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMyStream(stream);
            console.log(`Incoming Call from ${from} with call ID ${callId}`);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans, callId }); 
        } catch (error) {
            console.error("Error handling incoming call:", error);
        }
    }, [socket, peer]);

    const sendStreams = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach(track => {
                const sender = peer.peer.getSenders().find(s => s.track && s.track.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track);
                } else {
                    peer.peer.addTrack(track, myStream);
                }
            });
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(async ({ from, ans, callId }) => {
        console.log(`Received call acceptance for call ${callId} from ${from}`);
        console.log(`Current call ID: ${currentCallId}`); 
        if (callId !== currentCallId) {
            console.log(`Ignoring acceptance for outdated call. Expected ${currentCallId}, got ${callId}`);
            return;
        }
        if (isCallEstablished) {
            console.log("Call already established. Ignoring redundant acceptance.");
            return;
        }
        try {
            console.log("Setting remote description...");
            await peer.setLocalDescription(ans);
            console.log("Remote description set successfully");
            console.log("Call Accepted!");
            sendStreams();
            setIsCallEstablished(true);
        } catch (error) {
            console.error("Error in handleCallAccepted:", error);
        }
    }, [sendStreams, isCallEstablished, currentCallId, peer]);

    const handleCallEnd = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        peer.closeConnection();
        setMyStream(null);
        setRemoteStream(null);
        setRemoteSocketId(null);
        socket.emit("call:end", { to: remoteSocketId });
    }, [myStream, remoteStream, remoteSocketId, socket]);

    const handleNegoNeeded = useCallback(async () => {
        try {
            const offer = await peer.getOffer();
            socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
        } catch (error) {
            console.error("Error handling negotiation needed:", error);
        }
    }, [remoteSocketId, socket]);

    const handleScreenShare = useCallback(async () => {
        try {
            if (screenShare) {
                if (screenTrack) {
                    screenTrack.stop();
                }
                await peer.stopScreenShare(myStream.getVideoTracks()[0]);
                setScreenTrack(null);
                setScreenShare(false);
            } else {
                const newScreenTrack = await peer.startScreenShare();
                setScreenTrack(newScreenTrack);
                setScreenShare(true);
                newScreenTrack.onended = async () => {
                    await peer.stopScreenShare(myStream.getVideoTracks()[0]);
                    setScreenTrack(null);
                    setScreenShare(false);
                };
            }
        } catch (error) {
            console.error('Error handling screen share:', error);
        }
    }, [screenShare, myStream, screenTrack]);

    useEffect(() => {
        const handleTrackEvent = (ev) => {
            const remoteStream = ev.streams[0];
            console.log("Remote track received:", remoteStream);
            setRemoteStream(remoteStream);
        };

        if (peer.peer) {
            peer.peer.addEventListener("track", handleTrackEvent);
        }

        return () => {
            if (peer.peer) {
                peer.peer.removeEventListener("track", handleTrackEvent);
            }
        };
    }, []);

    useEffect(() => {
        if (peer.peer) {
            peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        }

        return () => {
            if (peer.peer) {
                peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
            }
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        try {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        } catch (error) {
            console.error("Error handling negotiation needed incoming:", error);
        }
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        try {
            await peer.setLocalDescription(ans);
        } catch (error) {
            console.error("Error handling final negotiation:", error);
        }
    }, []);

    const startRecording = useCallback(() => {
        if (myStream && remoteStream) {
            peer.startRecording(myStream, remoteStream);
            setIsRecording(true);
        }
    }, [myStream, remoteStream]);

    const stopRecording = useCallback(() => {
        peer.stopRecording();
        setIsRecording(false);
    }, []);

    const downloadRecording = useCallback(() => {
        const recordedBlobs = peer.getRecordedBlobs();
        const blob = new Blob(recordedBlobs, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recorded-session.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        peer.clearRecordedBlobs();
    }, []);

    useEffect(() => {
        const handleStreamChange = () => {
            if (peer.isCurrentlyRecording()) {
                stopRecording();
                startRecording();
            }
        };

        if (myStream) {
            myStream.getTracks().forEach(track => {
                track.onended = handleStreamChange;
            });
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                track.onended = handleStreamChange;
            });
        }

        return () => {
            if (myStream) {
                myStream.getTracks().forEach(track => {
                    track.onended = null;
                });
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => {
                    track.onended = null;
                });
            }
        };
    }, [myStream, remoteStream, startRecording, stopRecording]);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        socket.on("call:ended", handleCallEnd);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            socket.off("call:ended", handleCallEnd);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncomingCall,
        handleCallAccepted,
        handleNegoNeedIncoming,
        handleNegoNeedFinal,
        handleCallEnd,
    ]);

    return (
        <div className="room-container">
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
            <div className="video-container">
                {myStream && (
                    <div className="video-item">
                        <h1>My Stream</h1>
                        <video
                            className="video-element"
                            playsInline
                            autoPlay
                            ref={(ref) => ref && (ref.srcObject = myStream)}
                        />
                    </div>
                )}
                {remoteStream && (
                    <div className="video-item">
                        <h1>Remote Stream</h1>
                        <video
                            className="video-element"
                            playsInline
                            autoPlay
                            ref={(ref) => ref && (ref.srcObject = remoteStream)}
                        />
                    </div>
                )}
            </div>
            <div className="button-container">
                {myStream && <button className="call-button" onClick={sendStreams}>Send Stream</button>}
                {remoteSocketId && <button className="call-button" onClick={handleCallUser}>CALL</button>}
                {myStream && (
                    <>
                        <button className="end-call-button" onClick={handleCallEnd}>End Call</button>
                        <button className="screen-share-button" onClick={handleScreenShare}>
                            {screenShare ? "Stop Screen Share" : "Share Screen"}
                        </button>
                    </>
                )}
                {myStream && remoteStream && (
                    <>
                        {!isRecording ? (
                            <button className="recording-button" onClick={startRecording}>Start Recording</button>
                        ) : (
                            <button className="recording-button" onClick={stopRecording}>Stop Recording</button>
                        )}
                        {peer.getRecordedBlobs().length > 0 && (
                            <button className="recording-button" onClick={downloadRecording}>Download Recording</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RoomPage;
