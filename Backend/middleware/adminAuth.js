export const adminAuth = (req, res, next) => {
  const adminId = req.headers['x-admin-id'];
  if (!adminId) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  req.adminId = parseInt(adminId, 10);
  next();
};
