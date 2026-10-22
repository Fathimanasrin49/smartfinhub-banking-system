/**
 * Simple auth middleware - no JWT per requirements
 * Uses customer_id or employee_id from header for demo
 */
export const customerAuth = (req, res, next) => {
  const raw = req.headers['x-customer-id'] || req.query.customerId;
  if (raw == null || raw === '') {
    return res.status(401).json({ success: false, message: 'Customer ID required' });
  }
  const customerId = parseInt(raw, 10);
  if (Number.isNaN(customerId) || customerId < 1) {
    return res.status(401).json({ success: false, message: 'Invalid customer ID' });
  }
  req.customerId = customerId;
  next();
};

export const employeeAuth = (req, res, next) => {
  const raw = req.headers['x-employee-id'] || req.query.employeeId;
  if (raw == null || raw === '') {
    return res.status(401).json({ success: false, message: 'Employee ID required' });
  }
  const employeeId = parseInt(raw, 10);
  if (Number.isNaN(employeeId) || employeeId < 1) {
    return res.status(401).json({ success: false, message: 'Invalid employee ID' });
  }
  req.employeeId = employeeId;
  next();
};
