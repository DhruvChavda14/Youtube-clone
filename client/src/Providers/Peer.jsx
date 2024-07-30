class PeerService {
    constructor() {
        this.initialize();
    }

    initialize() {
        
        if (this.peer) {
            this.peer.close();
        }

        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });

        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordingChunks = [];
    }

    async getAnswer(offer) {
        if (!this.peer) {
            this.initialize(); 
        }
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
    }

    async setLocalDescription(ans) {
        if (!this.peer) {
            this.initialize();
        }
        try {
            
            if (this.peer.signalingState !== 'stable') {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            } else {
                console.warn('Peer connection is already in stable state. Ignoring redundant answer.');
            }
        } catch (error) {
            console.error('Error setting remote description:', error);
            
        }
    }
    async getOffer() {
        if (!this.peer || this.peer.signalingState === 'closed') {
            this.initialize();
        }
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    closeConnection() {
        if (this.peer) {
            this.peer.close();
            this.peer = null;
        }
        this.initialize(); 
    }


    async replaceTrack(newTrack) {
        if (!this.peer) {
            this.initialize(); 
        }
        const sender = this.peer.getSenders().find(s => s.track && s.track.kind === newTrack.kind);
        if (sender) {
            await sender.replaceTrack(newTrack);
        } else {
            console.error('No sender found for track kind:', newTrack.kind);
        }
    }

    async startScreenShare() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = stream.getVideoTracks()[0];
            await this.replaceTrack(screenTrack);
            return screenTrack;
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    async stopScreenShare(originalVideoTrack) {
        try {
            await this.replaceTrack(originalVideoTrack);
        } catch (error) {
            console.error('Error stopping screen share:', error);
            throw error;
        }
    }

    async startRecording(localStream, remoteStream) {
        if (this.isRecording) return;

        const stream = new MediaStream([
            ...localStream.getTracks(),
            ...remoteStream.getTracks()
        ]);

        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordingChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = async () => {
            this.isRecording = false;
            await this.saveRecording();
        };

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
    }

    async saveRecording() {
        const blob = new Blob(this.recordingChunks, { type: 'video/webm' });
        this.recordingChunks = []; 

        try {
            if (window.showSaveFilePicker) {
                
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'recorded-session.webm',
                    types: [{
                        description: 'WebM File',
                        accept: { 'video/webm': ['.webm'] },
                    }],
                });

                const writableStream = await fileHandle.createWritable();
                await writableStream.write(blob);
                await writableStream.close();
                console.log('Recording saved successfully');
            } else {
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'recorded-session.webm';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                console.log('Recording saved using fallback method');
            }
        } catch (error) {
            console.error('Failed to save recording:', error);
        }
    }


    isCurrentlyRecording() {
        return this.isRecording;
    }

    getRecordedBlobs() {
        return this.recordingChunks;
    }

    clearRecordedBlobs() {
        this.recordingChunks = [];
    }
}

export default new PeerService();