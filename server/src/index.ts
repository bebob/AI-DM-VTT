import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import diceRoutes from './routes/dice.js';
import campaignRoutes from './routes/campaign.js';
import narrativeRoutes from './routes/narrative.js';
import { setupGameSocket } from './sockets/gameSocket.js';

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/dice', diceRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/narrative', narrativeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// WebSocket
setupGameSocket(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`AI-DM-VTT server running on port ${PORT}`);
});
