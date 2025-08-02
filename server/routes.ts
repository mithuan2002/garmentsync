import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertCommentSchema, insertUpdateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (mock authentication)
  app.get("/api/auth/me", async (req, res) => {
    // For demo purposes, return the manufacturer user
    const user = await storage.getUser("user-1");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    // Mock stats - in real app would calculate from actual data
    const stats = {
      activeProjects: 12,
      pendingUpdates: 8,
      messagesToday: 24,
      completedOrders: 156,
    };
    res.json(stats);
  });

  // Get projects for current user
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo, get projects for manufacturer user
      const projects = await storage.getProjectsByUser("user-1");
      
      // Get buyer info for each project
      const projectsWithBuyer = await Promise.all(
        projects.map(async (project) => {
          const buyer = await storage.getUser(project.buyerId);
          return {
            ...project,
            buyerName: buyer?.company || buyer?.name || "Unknown",
          };
        })
      );
      
      res.json(projectsWithBuyer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const buyer = await storage.getUser(project.buyerId);
      const manufacturer = await storage.getUser(project.manufacturerId);
      const comments = await storage.getCommentsByProject(project.id);
      const files = await storage.getFilesByProject(project.id);

      // Get user info for comments
      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            author: user?.name || "Unknown",
            role: user?.role || "unknown",
          };
        })
      );

      res.json({
        ...project,
        buyerName: buyer?.company || buyer?.name || "Unknown",
        manufacturerName: manufacturer?.company || manufacturer?.name || "Unknown",
        comments: commentsWithUser,
        files,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update project status
  app.patch("/api/projects/:id/status", async (req, res) => {
    try {
      const { status, progress } = req.body;
      const project = await storage.updateProject(req.params.id, { status, progress });
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create update record
      await storage.createUpdate({
        projectId: project.id,
        userId: "user-1", // Mock current user
        message: `Status updated to ${status}`,
        type: "status_change",
      });

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  // Add comment to project
  app.post("/api/projects/:id/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId: "user-1", // Mock current user
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Get user info for response
      const user = await storage.getUser(comment.userId);
      const commentWithUser = {
        ...comment,
        author: user?.name || "Unknown",
        role: user?.role || "unknown",
      };

      res.status(201).json(commentWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Get recent activity
  app.get("/api/activity", async (req, res) => {
    try {
      // Get recent updates for user's projects
      const projects = await storage.getProjectsByUser("user-1");
      const projectIds = projects.map(p => p.id);
      
      let allUpdates: any[] = [];
      for (const projectId of projectIds) {
        const updates = await storage.getUpdatesByProject(projectId);
        const project = await storage.getProject(projectId);
        
        const updatesWithProject = updates.map(update => ({
          ...update,
          projectName: project?.name,
        }));
        
        allUpdates = [...allUpdates, ...updatesWithProject];
      }
      
      // Sort by date and limit to recent
      allUpdates.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
      const recentActivity = allUpdates.slice(0, 10);

      // Get user info for each activity
      const activityWithUsers = await Promise.all(
        recentActivity.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          return {
            ...activity,
            userName: user?.name || "Unknown",
            userRole: user?.role || "unknown",
          };
        })
      );

      res.json(activityWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
