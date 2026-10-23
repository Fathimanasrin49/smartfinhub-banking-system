import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import CustomerLayout from './components/customer/CustomerLayout';
import Login from './pages/customer/Login';
import Signup from './pages/customer/Signup';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Passbook from './pages/customer/Passbook';
import Transfer from './pages/customer/Transfer';
import Deposit from './pages/customer/Deposit';
import Withdraw from './pages/customer/Withdraw';
import Expenses from './pages/customer/Expenses';
import Feedback from './pages/customer/Feedback';
import Queue from './pages/customer/Queue';
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeCustomers from './pages/employee/EmployeeCustomers';
import EmployeeCustomerDetail from './pages/employee/EmployeeCustomerDetail';
import EmployeeApprovals from './pages/employee/EmployeeApprovals';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import EmployeeDisputes from './pages/employee/EmployeeDisputes';
import EmployeeQueue from './pages/employee/EmployeeQueue';
import EmployeeServiceRequests from './pages/employee/EmployeeServiceRequests';
import EmployeeFeedback from './pages/employee/EmployeeFeedback';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';

const WithLayout = (Page) => <CustomerLayout><Page /></CustomerLayout>;
const WithEmployeeLayout = (Page) => <EmployeeLayout><Page /></EmployeeLayout>;
const WithAdminLayout = (Page) => <AdminLayout><Page /></AdminLayout>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(CustomerDashboard)}</ProtectedRoute>} />
          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(CustomerDashboard)}</ProtectedRoute>} />
          <Route path="/customer/passbook" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Passbook)}</ProtectedRoute>} />
          <Route path="/customer/transfer" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Transfer)}</ProtectedRoute>} />
          <Route path="/customer/deposit" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Deposit)}</ProtectedRoute>} />
          <Route path="/customer/withdraw" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Withdraw)}</ProtectedRoute>} />
          <Route path="/customer/expenses" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Expenses)}</ProtectedRoute>} />
          <Route path="/customer/feedback" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Feedback)}</ProtectedRoute>} />
          <Route path="/customer/queue" element={<ProtectedRoute allowedRoles={['customer']}>{WithLayout(Queue)}</ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeDashboard)}</ProtectedRoute>} />
          <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeDashboard)}</ProtectedRoute>} />
          <Route path="/employee/customers" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeCustomers)}</ProtectedRoute>} />
          <Route path="/employee/customers/:id" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeCustomerDetail)}</ProtectedRoute>} />
          <Route path="/employee/approvals" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeApprovals)}</ProtectedRoute>} />
          <Route path="/employee/transactions" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeTransactions)}</ProtectedRoute>} />
          <Route path="/employee/disputes" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeDisputes)}</ProtectedRoute>} />
          <Route path="/employee/queue" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeQueue)}</ProtectedRoute>} />
          <Route path="/employee/service-requests" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeServiceRequests)}</ProtectedRoute>} />
          <Route path="/employee/feedback" element={<ProtectedRoute allowedRoles={['employee']}>{WithEmployeeLayout(EmployeeFeedback)}</ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminDashboard)}</ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminDashboard)}</ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminEmployees)}</ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminCustomers)}</ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminAnalytics)}</ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}>{WithAdminLayout(AdminLogs)}</ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
