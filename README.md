# SmartFinHub – Smart Banking Management System

SmartFinHub is a web-based banking management application designed to simplify banking operations and help users manage their accounts and transactions through a user-friendly interface.

## Technologies Used

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Tools:** Git, GitHub, VS Code

## Key Features

- Customer account management
- Deposit and withdrawal operations
- Balance and transaction history
- OTP-based login
- QR code payments
- Expense tracking
- Digital passbook
- EMI calculation
- Customer and bank staff modules

## Project Structure

- `frontend/` – User interface and client-side application
- `backend/` – Server-side logic and API endpoints
- `DB/` – Database-related files
- `workflow/` – Project workflow documentation

## Setup Instructions

### 1. Database

Make sure MySQL is installed and running. Import the project's SQL file using the appropriate database command, and configure the database connection in the backend.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Check the backend and frontend configuration files for the correct ports and environment settings.

## Security Note

Store database credentials, API keys, and other secrets in environment variables. Do not commit `.env` files or real user credentials to a public repository.

## Project Purpose

This project demonstrates full-stack web development concepts, database integration, API development, and banking transaction management.
