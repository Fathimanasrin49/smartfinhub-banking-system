# Smart FinHub Project Workflow

Smart FinHub is an integrated digital banking and financial management ecosystem serving three primary user roles: **Customers**, **Employees**, and **Administrators**.

## 1. Onboarding and Authentication
*   **Customer Signup**: Users register with personal details, phone number, and address. They must upload a KYC document (Aadhaar/PAN) for account verification.
*   **Employee Registration**: Staff register with branch assignments and specific roles (e.g., Teller, Manager).
*   **Secure Access**: Authentication is handled via email/password, with optional OTP support for enhanced security. Role-specific sessions are managed via custom headers.

## 2. Customer Banking Lifecycle
*   **Account Management**: Verified customers can view balance, passbook history, and account details in real-time.
*   **Financial Transactions**: Support for instant Deposits, Withdrawals, and Peer-to-Peer Transfers using account numbers.
*   **Expense Analytics**: Automated categorization of debits with interactive visual charts (Recharts) to track spending habits.
*   **Transaction Disputes**: If a transaction is suspicious or failed, customers can raise a formal dispute for investigation.

## 3. Employee & Branch Operations
*   **Dispute Management**: Employees monitor a centralized dashboard to resolve or reject customer disputes after verification.
*   **Branch Operations**: Staff manage queues and customer requests specific to their assigned branch.
*   **Customer Support**: Interaction with customers through automated feedback and ticket systems.

## 4. Administrative Oversight (AI-Powered)
*   **Fraud Detection Engine**: A background AI module analyzes transaction patterns to flag suspicious activities and generate risk alerts.
*   **Global Analytics**: Real-time monitoring of total deposits, transaction volumes, and high-risk alerts across the entire network.
*   **Data Governance**: Admins manage customer/employee lifecycles, review deep-dive audit logs for security, and trigger system-wide backups.

## 5. Technology Stack Summary
*   **Frontend**: React.js (Vite) + Framer Motion (Animations) + Recharts (Data Viz).
*   **Backend**: Node.js (Express) + MySQL (Relational Data).
*   **Communication**: Nodemailer (SMTP) for OTP and alerts.
