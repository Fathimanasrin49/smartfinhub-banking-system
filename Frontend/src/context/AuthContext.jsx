import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    const account = localStorage.getItem('accountNumber');
    const employeeId = localStorage.getItem('employeeId');
    const adminId = localStorage.getItem('adminId');
    if (id && name && role) {
      if (role === 'admin' && !adminId) localStorage.setItem('adminId', id);
      setUser({
        id: parseInt(id, 10),
        name,
        role,
        account_number: account || undefined,
        employee_id: employeeId || undefined,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userRole', userData.role);
    if (userData.account_number) localStorage.setItem('accountNumber', userData.account_number);
    else localStorage.removeItem('accountNumber');
    if (userData.employee_id) localStorage.setItem('employeeId', userData.employee_id);
    else localStorage.removeItem('employeeId');
    localStorage.setItem('customerId', userData.role === 'customer' ? userData.id : '');
    localStorage.setItem('adminId', userData.role === 'admin' ? userData.id : '');
    setUser({
      id: userData.id,
      name: userData.name,
      role: userData.role,
      account_number: userData.account_number,
      employee_id: userData.employee_id,
    });
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accountNumber');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('customerId');
    localStorage.removeItem('adminId');
    setUser(null);
  };

  const customer = user?.role === 'customer' ? user : null;

  return (
    <AuthContext.Provider value={{ user, customer, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
