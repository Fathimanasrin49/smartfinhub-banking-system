import { Router } from 'express';
import { customerAuth } from '../../middleware/auth.js';
import * as ctrl from './customer.controller.js';

const router = Router();

// Public routes
router.get('/branches', ctrl.getBranches);

// Protected routes (require X-Customer-Id header)
router.use(customerAuth);

router.get('/profile', ctrl.profile);
router.get('/balance', ctrl.balance);
router.post('/deposit', ctrl.depositMoney);
router.post('/withdraw', ctrl.withdrawMoney);
router.post('/transfer', ctrl.transferFunds);
router.get('/transactions', ctrl.transactions);
router.get('/transactions/:id', ctrl.transactionById);
router.get('/statement/download', ctrl.downloadStatement);
router.get('/alerts', ctrl.alerts);
router.get('/expenses/summary', ctrl.expensesSummary);
router.get('/expenses/insights', ctrl.expenseInsights);
router.post('/generate-token', ctrl.generateToken);
router.get('/token-status', ctrl.tokenStatus);
router.post('/service-request', ctrl.submitServiceRequest);
router.post('/feedback', ctrl.submitFeedback);
router.post('/dispute', ctrl.submitDispute);
router.get('/pending-approvals', ctrl.getPendingApprovals);

export default router;
