import { Router } from 'express';
import { employeeAuth } from '../../middleware/auth.js';
import * as ctrl from './employee.controller.js';

const router = Router();

router.use(employeeAuth);

router.get('/dashboard', ctrl.dashboard);
router.get('/branches', ctrl.getBranches);

router.get('/customers', ctrl.getCustomers);
router.get('/customers/:id', ctrl.getCustomerById);
router.post('/customers', ctrl.createCustomer);
router.put('/customers/:id', ctrl.updateCustomer);
router.put('/customers/:id/kyc', ctrl.updateCustomerKyc);
router.get('/customers/:id/transactions', ctrl.getCustomerTransactions);

router.get('/approvals', ctrl.getApprovals);
router.post('/approvals/:id/approve', ctrl.approveRequest);
router.post('/approvals/:id/reject', ctrl.rejectRequest);

router.post('/branch-deposit', ctrl.branchDeposit);
router.post('/branch-withdraw', ctrl.branchWithdraw);

router.get('/queue', ctrl.getQueue);
router.post('/queue/:id/serve', ctrl.serveToken);
router.post('/queue/:id/cancel', ctrl.cancelToken);

router.get('/service-requests', ctrl.getServiceRequests);
router.post('/service-requests/:id/assign', ctrl.assignServiceRequest);
router.post('/service-requests/:id/resolve', ctrl.resolveServiceRequest);

router.get('/feedback', ctrl.getFeedback);

router.get('/disputes', ctrl.getDisputes);
router.get('/disputes/:id', ctrl.getDisputeById);
router.post('/disputes/:id/resolve', ctrl.resolveDispute);

router.get('/transactions', ctrl.getTransactions);

export default router;
