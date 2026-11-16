# NetScope – IP Traffic Monitoring Dashboard

NetScope is a web-based IP Traffic Monitoring Dashboard designed to simulate web requests from different IP addresses, classify visitors by country, and visualize traffic statistics in real time.

The application provides an administrative interface for monitoring simulated web traffic, analyzing request patterns, and viewing HTTP request logs.

## Features

### 1. Web Request Simulation
- Generate simulated web requests from multiple IP addresses.
- Support for HTTP methods: GET, POST, PUT, and DELETE.
- Simulate different API endpoints.
- Generate HTTP status codes such as 200, 201, 400, 404, and 500.
- Generate simulated response times.

### 2. IP Address and Country Classification
- Associate IP addresses with country information.
- Display visitor countries in the dashboard.
- Organize traffic according to geographical origin.

### 3. Traffic Analytics
- Display total number of requests.
- Track unique IP addresses.
- Count the number of countries represented.
- Calculate average response time.
- Visualize country-wise request distribution.
- Display HTTP status code distribution.

### 4. Real-Time Monitoring
- Implement real-time communication using Socket.IO.
- Automatically update request logs when new requests are generated.
- Avoid manual browser refreshes.

### 5. Request Log Management
- Store request records in an SQLite database.
- Display IP address, country, HTTP method, endpoint, status code, response time, and timestamp.
- Retrieve historical request logs.
- Clear stored logs through the dashboard.

### 6. Customization
- Customize dashboard colors and appearance using the CSS Generator.
- Adjust accent colors, background colors, panel colors, text colors, border radius, and font size.
- Download the generated CSS theme.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| Node.js | Backend runtime |
| Express.js | REST API development |
| SQLite | Request log storage |
| better-sqlite3 | SQLite database integration |
| Socket.IO | Real-time communication |
| geoip-lite | IP geolocation lookup integration |
| Recharts | Dashboard charts |
| Lucide React | Icons |
| CSS | Styling and responsive design |

## Project Structure

```text
admin_dashboard/
│
├── server.js
├── database.js
├── requests.db
├── package.json
├── package-lock.json
├── .gitignore
│
├── routes/
│   └── simulator.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    │
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Installation and Setup

### Prerequisites

Install the following:
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Holabae/Netscope.git
```

### 2. Navigate to the Project Directory

```bash
cd Netscope
```

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Start the Backend Server

From the project root:

```bash
node server.js
```

The backend server runs at:

```text
http://localhost:5000
```

### 6. Start the Frontend

Open another terminal:

```bash
cd Netscope/frontend
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check backend server status |
| POST | `/api/simulate` | Generate simulated web requests |
| GET | `/api/logs` | Retrieve all request logs |
| DELETE | `/api/logs` | Delete all request logs |

### Generate Simulated Requests

Example:

```bash
curl -X POST http://localhost:5000/api/simulate \
-H "Content-Type: application/json" \
-d '{"count":5}'
```

This generates five simulated requests and stores them in the database.

### Retrieve Request Logs

```bash
curl http://localhost:5000/api/logs
```

### Clear Request Logs

```bash
curl -X DELETE http://localhost:5000/api/logs
```

## Database Schema

The application uses an SQLite database named `requests.db`.

The `request_logs` table contains:

| Column | Description |
|---|---|
| id | Unique request identifier |
| ip_address | Visitor IP address |
| country | Associated country |
| method | HTTP request method |
| endpoint | Requested endpoint |
| status_code | HTTP response status |
| response_time | Simulated response time in milliseconds |
| timestamp | Time when the record was stored |

## Real-Time Communication

NetScope uses Socket.IO for real-time updates.

The workflow is:

1. The user generates simulated traffic.
2. The Express backend processes the request.
3. The request record is stored in SQLite.
4. Socket.IO broadcasts a `new-log` event.
5. The React frontend receives the event.
6. The dashboard updates its request logs automatically.

## Important Note About Simulation

NetScope currently operates as a traffic simulation system. The generated request methods, endpoints, status codes, and response times are simulated values.

The test IP addresses used in the initial configuration belong to reserved documentation ranges, and their country labels are manually assigned for demonstration. They do not represent actual IP geolocation results.

The application is intended for educational purposes and demonstrating IP traffic monitoring concepts.

## Future Enhancements

- Integrate live IP geolocation services.
- Support actual web server access log monitoring.
- Add date-wise and time-wise traffic analysis.
- Implement user authentication and role-based access.
- Add export functionality for request logs.
- Introduce advanced traffic filtering and search.
- Add alerting for unusual traffic patterns.

## Author

**NetScope – IP Traffic Monitoring Dashboard**

Developed as an educational project to demonstrate web traffic simulation, IP classification, backend API development, database integration, and real-time dashboard monitoring.
