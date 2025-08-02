import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertUpdateSchema, insertCommentSchema, insertStakeholderSchema } from "@shared/schema";
import { emailService } from "./email-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const updates = await storage.getUpdatesByOrder(order.id);
      const comments = await storage.getCommentsByOrder(order.id);
      const stakeholders = await storage.getStakeholdersByOrder(order.id);

      res.json({
        ...order,
        updates,
        comments,
        stakeholders,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Add update to order
  app.post("/api/orders/:id/updates", async (req, res) => {
    try {
      const validatedData = insertUpdateSchema.parse({
        ...req.body,
        orderId: req.params.id,
      });
      
      const update = await storage.createUpdate(validatedData);
      
      // Send email notifications to stakeholders
      const order = await storage.getOrder(req.params.id);
      const stakeholders = await storage.getStakeholdersByOrder(req.params.id);
      
      if (order && stakeholders.length > 0) {
        const stakeholderEmails = stakeholders.map(s => s.email);
        await emailService.notifyStakeholders(
          stakeholderEmails,
          { id: order.id, buyerName: order.buyerName, styleNumber: order.styleNumber },
          { type: 'update', message: update.message, authorName: update.authorName, authorRole: update.authorRole }
        );
      }
      
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add update" });
    }
  });

  // Add comment to order
  app.post("/api/orders/:id/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        orderId: req.params.id,
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Send email notifications to stakeholders
      const order = await storage.getOrder(req.params.id);
      const stakeholders = await storage.getStakeholdersByOrder(req.params.id);
      
      if (order && stakeholders.length > 0) {
        const stakeholderEmails = stakeholders.map(s => s.email);
        await emailService.notifyStakeholders(
          stakeholderEmails,
          { id: order.id, buyerName: order.buyerName, styleNumber: order.styleNumber },
          { type: 'comment', message: comment.message, authorName: comment.authorName, authorRole: comment.authorRole }
        );
      }
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Stakeholder management routes
  app.get("/api/orders/:id/stakeholders", async (req, res) => {
    try {
      const stakeholders = await storage.getStakeholdersByOrder(req.params.id);
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stakeholders" });
    }
  });

  app.post("/api/orders/:id/stakeholders", async (req, res) => {
    try {
      const validatedData = insertStakeholderSchema.parse({
        ...req.body,
        orderId: req.params.id,
      });
      
      const stakeholder = await storage.createStakeholder(validatedData);
      
      // Send invitation email
      const order = await storage.getOrder(req.params.id);
      if (order) {
        await emailService.sendStakeholderInvitation(
          stakeholder.email,
          stakeholder.name,
          { id: order.id, buyerName: order.buyerName, styleNumber: order.styleNumber },
          req.body.inviterName || "System Admin",
          stakeholder.role,
          stakeholder.permissions
        );
      }
      
      res.status(201).json(stakeholder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add stakeholder" });
    }
  });

  // Bulk invite stakeholders
  app.post("/api/orders/:id/stakeholders/bulk-invite", async (req, res) => {
    try {
      const { emailList, defaultRole, defaultPermissions, message, inviterName } = req.body;
      
      // Parse email list (comma or newline separated)
      const emails = emailList
        .split(/[,\n]/)
        .map((email: string) => email.trim())
        .filter((email: string) => email.length > 0);
      
      if (emails.length === 0) {
        return res.status(400).json({ message: "No valid emails provided" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      let successCount = 0;
      let addedCount = 0;
      const results = [];

      for (const email of emails) {
        try {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            results.push({ email, status: 'invalid', error: 'Invalid email format' });
            continue;
          }

          // Check if stakeholder already exists
          const existingStakeholders = await storage.getStakeholdersByOrder(req.params.id);
          const exists = existingStakeholders.some(s => s.email === email);
          
          if (exists) {
            results.push({ email, status: 'exists', error: 'Already a stakeholder' });
            continue;
          }

          // Extract name from email (before @)
          const name = email.split('@')[0].replace(/[._]/g, ' ').split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

          // Create stakeholder
          const stakeholderData = {
            orderId: req.params.id,
            name,
            email,
            role: defaultRole,
            permissions: defaultPermissions,
          };

          const stakeholder = await storage.createStakeholder(stakeholderData);
          addedCount++;

          // Send invitation email with custom message
          await emailService.sendStakeholderInvitation(
            stakeholder.email,
            stakeholder.name,
            { id: order.id, buyerName: order.buyerName, styleNumber: order.styleNumber },
            inviterName || "System Admin",
            stakeholder.role,
            stakeholder.permissions,
            message
          );
          successCount++;

          results.push({ email, status: 'success', stakeholder });
        } catch (error) {
          results.push({ email, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      res.status(201).json({
        successCount,
        addedCount,
        totalEmails: emails.length,
        results
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process bulk invitations" });
    }
  });

  app.delete("/api/stakeholders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStakeholder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Stakeholder not found" });
      }
      res.json({ message: "Stakeholder deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stakeholder" });
    }
  });

  app.patch("/api/stakeholders/:id/permissions", async (req, res) => {
    try {
      const { permissions } = req.body;
      const stakeholder = await storage.updateStakeholderPermissions(req.params.id, permissions);
      
      if (!stakeholder) {
        return res.status(404).json({ message: "Stakeholder not found" });
      }

      res.json(stakeholder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stakeholder permissions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
