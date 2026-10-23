import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
['photos', 'kyc'].forEach((d) => {
  const dir = path.join(uploadsDir, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import { verifyMailer } from './config/mailer.js';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);

app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/employee', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running` );
  verifyMailer();
});
