# Smart Fin Hub - Customer Module

## Setup

### 1. Database (MySQL)
```bash
mysql -u root -p < db.sql
```
Update `Backend/config/database.js` if your MySQL credentials differ (host, user, password).

### 2. Backend
```bash
cd Backend
npm install
npm run dev
```
API runs on http://localhost:5000

### 3. Frontend
```bash
cd Frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## Demo Login
- **Email:** rahul@example.com
- **Password:** demo123

## API Authentication
Protected endpoints require `X-Customer-Id` header (set automatically after login).
