import { Request, Response } from "express";
import { isAuthenticated } from "./replitAuth";

type ClientConnection = {
  id: string;
  response: Response;
  userId: string;
};

class SSEManager {
  private clients: Map<string, ClientConnection> = new Map();

  // Middleware to establish SSE connection
  public createConnection = (req: Request, res: Response) => {
    // Auth check
    isAuthenticated(req, res, () => {
      const userId = (req.user as any).claims.sub;
      const clientId = Date.now().toString();
  
      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
  
      // Send initial connection established message
      res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);
  
      // Store client connection
      this.clients.set(clientId, {
        id: clientId,
        response: res,
        userId,
      });
  
      // Remove client when connection closes
      req.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Client ${clientId} disconnected, ${this.clients.size} connections remaining`);
      });
  
      console.log(`Client ${clientId} connected, ${this.clients.size} total connections`);
    });
  };

  // Send notification to specific user
  public sendToUser(userId: string, data: any): void {
    let sent = false;
    
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        this.sendEventToClient(client, data);
        sent = true;
      }
    }

    if (!sent) {
      console.log(`No active connection for user ${userId}`);
    }
  }

  // Send notification to admin users
  public sendToAdmins(data: any): void {
    let sent = false;
    
    for (const client of this.clients.values()) {
      if (client.userId.endsWith('_admin')) { // Temporary way to check for admin role
        this.sendEventToClient(client, data);
        sent = true;
      }
    }

    if (!sent) {
      console.log("No active admin connections");
    }
  }

  // Send notification to all connected clients
  public broadcast(data: any): void {
    for (const client of this.clients.values()) {
      this.sendEventToClient(client, data);
    }
  }

  private sendEventToClient(client: ClientConnection, data: any): void {
    try {
      client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error(`Error sending to client ${client.id}:`, error);
      // Remove client on error
      this.clients.delete(client.id);
    }
  }

  // Get the number of connected clients
  public getConnectionCount(): number {
    return this.clients.size;
  }
}

// Singleton instance
export const sseManager = new SSEManager();
