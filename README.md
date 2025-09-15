# 📝 Notes App

A **MERN stack application** with a clean and modular backend and a React frontend.  
This project provides full CRUD functionality for notes with secure authentication and MongoDB persistence.

---

## 🚀 Features

- **User Authentication** – sign up, login, JWT-based authentication & authorization  
- **Secure Passwords** – hashed with **bcrypt**  
- **Notes Management** – create, read, update, and delete notes  
- **Role-Based Access (optional)** – extendable for admin/member roles  
- **RESTful API** – clean and structured endpoints for frontend and external use  
- **Scalable Architecture** – modular controllers, routes, and models  
- **Responsive Frontend** – React-based UI to interact with the API  

---

## 🛠️ Technologies & Modules Used

- **MongoDB** & **Mongoose** – database and schema modeling  
- **Express.js** – backend API handling  
- **React.js** – frontend development  
- **Node.js** – server runtime  
- **JWT (JSON Web Tokens)** – authentication and authorization  
- **bcrypt** – password hashing  
- **dotenv** – environment variable management  
- **CORS** – cross-origin access between frontend and backend  

---

## 📂 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/GuranshBedi/notes.git
cd notes
```

2. Backend Setup
```bash
cd backend
npm install
```

Create a .env file inside backend/:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run the backend:

```bash
npm run dev
```

The server will run on http://localhost:5000.

3. Frontend Setup
 ```bash
cd ../frontend
npm install
```

Create a .env file inside frontend/:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm start
```

The app will run on http://localhost:3000.

🔗 API Endpoints
Auth

POST /api/auth/register – Register a new user

POST /api/auth/login – Login and receive JWT

Notes

GET /api/notes – Fetch all notes for logged-in user

POST /api/notes – Create a new note

GET /api/notes/:id – Fetch a specific note

PUT /api/notes/:id – Update a note

DELETE /api/notes/:id – Delete a note
