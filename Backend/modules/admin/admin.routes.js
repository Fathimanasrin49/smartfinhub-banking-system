import { Router } from 'express';
import { adminAuth } from '../../middleware/adminAuth.js';
import * as ctrl from './admin.controller.js';

const router = Router();
router.use(adminAuth);

router.get('/dashboard', ctrl.dashboard);
router.get('/employees', ctrl.getEmployees);
router.put('/employees/:id', ctrl.updateEmployee);
router.get('/customers', ctrl.getCustomers);
router.put('/customers/:id', ctrl.updateCustomer);
router.get('/suspicious', ctrl.getSuspiciousActivities);
router.get('/analytics/transactions', ctrl.getAnalyticsTransactions);
router.get('/analytics/expenses', ctrl.getAnalyticsExpenses);
router.get('/analytics/risks', ctrl.getAnalyticsRisks);
router.get('/logs', ctrl.getLogs);
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);
router.post('/backup', ctrl.triggerBackup);
router.get('/branches', ctrl.getBranches);

export default router;
