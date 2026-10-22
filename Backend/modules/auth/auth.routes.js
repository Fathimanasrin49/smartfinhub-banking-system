import { Router, json } from 'express';
import * as ctrl from './auth.controller.js';
import { signupUpload } from '../../middleware/upload.js';

const router = Router();

router.post('/login', json(), ctrl.login);
router.post('/send-otp', json(), ctrl.sendOtp);
router.post('/login-otp', json(), ctrl.loginWithOtp);

router.post('/signup', (req, res, next) => {
  signupUpload(req, res, (err) => {
    if (err) {
      console.error('[Signup] Multer error:', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
  });
}, ctrl.signup);

router.get('/branches', ctrl.getBranches);

export default router;
