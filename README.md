#  Task Manager Pro - Backend

Backend API for Task Manager Pro application.  
Built using Node.js, Express, MongoDB with JWT authentication and refresh token rotation.

---

#  Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- dotenv

---

#  Folder Structure

```
backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── server.js
└── .env
```

---

#  Setup Instructions

##  Install Dependencies

```bash
npm install
```

---

## Create .env File

Create a `.env` file in root:

```
NODE_ENV=production
PORT=5000

MONGO_URI=mongodb+srv://mallikarjun09051997_db_user:BXbIt6o8ND6WrLbY@task.z2v1pap.mongodb.net/taskmanager?retryWrites=true&w=majority

JWT_SECRET=super_access_secret
JWT_REFRESH_SECRET=super_refresh_secret

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLIENT_URL=https://taskmanager-frontend-uzr3.onrender.com/

```

---

##  Run Server

Development mode:

```bash
npm run dev
```

Production:

```bash
node server.js
```

Server runs at:

```
http://localhost:5000
```

---

#  Authentication System

- Access Token (Short expiry)
- Refresh Token
- Refresh Token Rotation
- Role-based Authorization

---

#  API Endpoints

## Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user |

---

#  Default Credentials

## Admin

```
Email: admin@taskmanager.com
Password: Admin@123
Role: ADMIN
```

## Manager

```
Email: manager@taskmanager.com
Password: Manager@123
Role: MANAGER
```


#  Deployment

Backend deployed on:

```
Render
```

 Production API:

```
https://taskmanager-backend-u0mq.onrender.com
```



