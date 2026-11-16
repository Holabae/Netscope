const express = require("express");
const router = express.Router();

const testVisitors = [
    { ip: "203.0.113.10", country: "India" },
    { ip: "198.51.100.20", country: "United States" },
    { ip: "192.0.2.30", country: "United Kingdom" },
    { ip: "203.0.113.40", country: "Germany" },
    { ip: "198.51.100.50", country: "Japan" },
    { ip: "192.0.2.60", country: "Australia" },
    { ip: "203.0.113.70", country: "Canada" },
    { ip: "198.51.100.80", country: "France" }
];

const methods = ["GET", "POST", "PUT", "DELETE"];

const endpoints = [
    "/", "/login", "/products", "/dashboard",
    "/api/users", "/api/orders", "/contact"
];

const statuses = [200, 200, 200, 201, 400, 404, 500];

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRequest(db, io) {
    const visitor = randomItem(testVisitors);
    const method = randomItem(methods);
    const endpoint = randomItem(endpoints);
    const status = randomItem(statuses);
    const responseTime = Math.floor(Math.random() * 450) + 20;

    const result = db.prepare(`
        INSERT INTO request_logs
        (ip_address, country, method, endpoint, status_code, response_time)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        visitor.ip,
        visitor.country,
        method,
        endpoint,
        status,
        responseTime
    );

    const log = db.prepare(
        "SELECT * FROM request_logs WHERE id = ?"
    ).get(result.lastInsertRowid);

    io.emit("new-log", log);

    return log;
}

router.post("/", (req, res) => {
    try {
        const count = Number(req.body.count ?? 1);

        if (!Number.isInteger(count) || count < 1 || count > 50) {
            return res.status(400).json({
                error: "Count must be an integer between 1 and 50"
            });
        }

        const logs = [];

        for (let i = 0; i < count; i++) {
            logs.push(
                generateRequest(
                    req.app.locals.db,
                    req.app.locals.io
                )
            );
        }

        res.status(201).json({
            message: `${count} simulated request(s) generated`,
            logs
        });

    } catch (error) {
        console.error("Simulation error:", error);
        res.status(500).json({
            error: "Unable to generate requests"
        });
    }
});

module.exports = router;
