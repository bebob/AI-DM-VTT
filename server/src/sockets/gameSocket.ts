import type { Server as IOServer, Socket } from 'socket.io';
import { rollDice } from '../services/diceEngine.js';

export function setupGameSocket(io: IOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('dice:roll', (data: { expression: string; label?: string }) => {
      try {
        const result = rollDice(data.expression);
        if (data.label) result.label = data.label;
        socket.emit('dice:result', result);
        // Broadcast to all clients (for future multiplayer)
        socket.broadcast.emit('dice:result', { ...result, roller: socket.id });
      } catch (err: any) {
        socket.emit('dice:error', { error: err.message });
      }
    });

    socket.on('narrative:input', (data: { text: string; mode: string }) => {
      // In v1, just echo back. Later this sends to the AI narrator.
      socket.emit('narrative:received', { text: data.text, mode: data.mode });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
