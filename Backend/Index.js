import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import addRoutes from './routes/addRoute.js';
import authRoutes from './modules/auth/auth.routes.js';
import getRoutes from './routes/getRoute.js';
import deleteRoutes from './routes/deleteRoute.js';
import updateRoutes from './routes/updateRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
['photos', 'kyc'].forEach((d) => {
  const dir = path.join(uploadsDir, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
app.use(cors(
    {
        origin:'*',
        methods:['GET' , 'POST' ,'PUT','DELETE'],
        credentials:true
      }
      ))
      
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use(express.json());
app.use('/api/add', addRoutes);
app.use('/api/get', getRoutes)
app.use('/api/update', updateRoutes)
app.use('/api/delete', deleteRoutes)




app.listen(8081, () => {
  console.log('Server is running');
});
