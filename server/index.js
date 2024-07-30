import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import bodyParser from "body-parser";
import userRoutes from './routes/user.js';
import videoRoutes from './routes/video.js';
import commentsRoutes from './routes/comments.js';
import { createServer } from 'http';
import { Server } from "socket.io";

import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static(path.join('uploads')));
app.use(bodyParser.json());


const io = new Server(8000, {
    cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join", (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer, callId }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer, callId });
    });
    socket.on("call:accept", (data) => {
        io.to(data.to).emit("call:accepted", { from: socket.id, ans: data.ans });
    });
    socket.on("call:accepted", ({ to, ans, callId }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans, callId });
    });

    socket.on("call:end", ({ to }) => {
        io.to(to).emit("call:ended");
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
});



const server = createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Server Running on the PORT ${process.env.PORT}`);
});


app.get('/', (req, res) => {
    res.send("Hello, World!");
});

app.use('/user', userRoutes);
app.use('/video', videoRoutes);
app.use('/comment', commentsRoutes);

const DB_URL = process.env.CONNECTION_URL;
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("MongoDB database connected");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});
