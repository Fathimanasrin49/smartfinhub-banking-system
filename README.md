# Smart FinHub – Customer Module

## Setup

### 1. Database (MySQL)

Run the following command from the project root directory:

```bash
mysql -u root -p < DB.sql
```

Update `Backend/config/database.js` if your MySQL credentials differ.

### 2. Backend

Open a terminal and run:

```bash
cd Backend
npm install
npm run dev
```

Backend API runs at: http://localhost:5000

### 3. Frontend

Open another terminal and run:

```bash
cd Frontend
npm install
npm run dev
```

Frontend app runs at: http://localhost:5173

## Demo Login

- **Email:** rahul@example.com
- **Password:** `demo123`

## API Authentication

Protected endpoints require the `X-Customer-Id` header. It is set automatically after login.

## Technologies Used

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL