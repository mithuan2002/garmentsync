import { type User, type InsertUser, type Project, type InsertProject, type Update, type InsertUpdate, type Comment, type InsertComment, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Updates
  getUpdatesByProject(projectId: string): Promise<Update[]>;
  createUpdate(update: InsertUpdate): Promise<Update>;
  
  // Comments
  getCommentsByProject(projectId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Files
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private updates: Map<string, Update>;
  private comments: Map<string, Comment>;
  private files: Map<string, File>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.updates = new Map();
    this.comments = new Map();
    this.files = new Map();
    
    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const manufacturerUser: User = {
      id: "user-1",
      username: "sarah_chen",
      email: "sarah@garmentworks.com",
      password: "hashed_password",
      role: "manufacturer",
      name: "Sarah Chen",
      company: "GarmentWorks Ltd",
      createdAt: new Date(),
    };

    const buyerUser: User = {
      id: "user-2",
      username: "mike_johnson",
      email: "mike@fashionforward.com",
      password: "hashed_password",
      role: "buyer",
      name: "Mike Johnson",
      company: "FashionForward Inc.",
      createdAt: new Date(),
    };

    this.users.set(manufacturerUser.id, manufacturerUser);
    this.users.set(buyerUser.id, buyerUser);

    // Create demo projects
    const project1: Project = {
      id: "project-1",
      name: "Summer Collection 2024",
      description: "Premium cotton t-shirts and polo shirts for retail chain",
      status: "production",
      priority: "high",
      buyerId: buyerUser.id,
      manufacturerId: manufacturerUser.id,
      quantity: 5000,
      deadline: new Date("2024-03-15"),
      progress: 65,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date(),
    };

    const project2: Project = {
      id: "project-2",
      name: "Corporate Uniforms",
      description: "Custom embroidered uniforms for hotel chain staff",
      status: "quality_check",
      priority: "medium",
      buyerId: buyerUser.id,
      manufacturerId: manufacturerUser.id,
      quantity: 2000,
      deadline: new Date("2024-02-28"),
      progress: 85,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date(),
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      company: insertUser.company || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.buyerId === userId || project.manufacturerId === userId
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      status: insertProject.status || "design",
      priority: insertProject.priority || "medium",
      progress: insertProject.progress || 0,
      description: insertProject.description || null,
      quantity: insertProject.quantity || null,
      deadline: insertProject.deadline || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Updates
  async getUpdatesByProject(projectId: string): Promise<Update[]> {
    return Array.from(this.updates.values())
      .filter(update => update.projectId === projectId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createUpdate(insertUpdate: InsertUpdate): Promise<Update> {
    const id = randomUUID();
    const update: Update = {
      ...insertUpdate,
      id,
      type: insertUpdate.type || "update",
      createdAt: new Date(),
    };
    this.updates.set(id, update);
    return update;
  }

  // Comments
  async getCommentsByProject(projectId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.projectId === projectId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Files
  async getFilesByProject(projectId: string): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      ...insertFile,
      id,
      createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
