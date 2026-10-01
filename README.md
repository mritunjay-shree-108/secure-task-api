# Secure Task Manager

A full-stack task management application built with **React + TypeScript** on the frontend and **Node.js + Express + MongoDB** on the backend.

The project focuses on secure authentication, protected APIs, task management, validation, and a responsive task-management workflow.

## Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- Protected routes
- Refresh-token based authentication
- Password hashing with bcrypt
- Role-based authorization
- Request validation
- User-specific task access

### Task Management

- Create tasks
- View tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed / pending
- Search tasks
- Filter by completion status
- Pagination
- Empty-state handling
- Per-operation loading states
- Success and error feedback

### Frontend Architecture

- React + TypeScript
- React Router
- Context API for authentication state
- Reusable components
- Custom `useTasks` hook
- Typed API requests
- Shared TypeScript types
- Controlled forms

### Backend Architecture

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Middleware-based authorization
- Zod validation
- RESTful API design
- Centralized async/error handling
- Database indexes
- Automated API tests

## Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | React, TypeScript, Vite |
| Routing           | React Router            |
| Backend           | Node.js, Express        |
| Database          | MongoDB, Mongoose       |
| Authentication    | JWT                     |
| Password Security | bcrypt                  |
| Validation        | Zod                     |
| Testing           | Jest / Supertest        |
| API               | REST                    |

## Project Structure

text```
secure-task-api/
│
├── controller/
├── middleware/
├── models/
├── routes/
├── schemas/
├── test/
├── util/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Getting Started

1. Clone the repository
bash```
git clone https://github.com/mritunjay-shree-108/secure-task-api.git
cd secure-task-api
```

2. Backend setup
Install dependencies:
bash```
   npm install
```

Create a .env file using .env.example as a reference and add your local configuration.

Start the backend:
bash```
npm start
```

The backend runs on the configured local port.

3. Frontend setup

Open a second terminal:
bash```
cd frontend
npm install
```

Start the React development server:
bash```
npm run dev
```

The frontend will be available at the URL shown by Vite.

## API Overview

Authentication

text```
POST /api/auth/register
POST /api/auth/login
```

User
text```
GET /api/auth/profile
```

Tasks
text```
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
PATCH /api/tasks/:id
DELETE /api/tasks/:id
```
Task listing supports pagination, search, and completion filtering.

Example:
text```
GET /api/tasks?page=1&limit=5&search=react&completed=true
```

## Testing

Run backend tests with:
bash```
npm test
```

The project includes automated tests covering authentication, API behavior, task functionality, validation, and related backend behavior.


### Security Notes

- Secrets are stored in environment variables.
- .env files are excluded from Git.
- Passwords are hashed before storage.
- Protected routes require valid authentication.
- Users can access only their authorized task resources.
- Request data is validated before processing.


### Future Improvements
- Better UI styling and responsive design
- Toast notification system
- Task sorting
- Dark mode
- Automated frontend testing
- Deployment
- CI/CD with GitHub Actions

## Author
Mritunjay Shree

GitHub:
https://github.com/mritunjay-shree-108

```
