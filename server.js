
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./database");
const simulator = require("./routes/simulator");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.locals.db = db;
app.locals.io = io;

app.get("/", (req, res) => {
    res.send("IP Monitoring Dashboard Backend Running!");
});
// Return the latest 100 request logs
app.get("/api/logs", (req, res) => {
    try {
        const logs = db.prepare(`
            SELECT * FROM request_logs
            ORDER BY id DESC
            LIMIT 100
        `).all();

        res.json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({
            error: "Unable to fetch request logs"
        });
    }
});

app.use("/api/simulate", simulator);

io.on("connection", (socket) => {
    console.log("Dashboard connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Dashboard disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});
