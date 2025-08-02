import { type Order, type Update, type Comment, type Stakeholder, type InsertOrder, type InsertUpdate, type InsertComment, type InsertStakeholder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Updates
  getUpdatesByOrder(orderId: string): Promise<Update[]>;
  createUpdate(update: InsertUpdate): Promise<Update>;

  // Comments
  getCommentsByOrder(orderId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Stakeholders
  getStakeholdersByOrder(orderId: string): Promise<Stakeholder[]>;
  createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder>;
  deleteStakeholder(id: string): Promise<boolean>;
  updateStakeholderPermissions(id: string, permissions: string): Promise<Stakeholder | undefined>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private updates: Map<string, Update>;
  private comments: Map<string, Comment>;
  private stakeholders: Map<string, Stakeholder>;

  constructor() {
    this.orders = new Map();
    this.updates = new Map();
    this.comments = new Map();
    this.stakeholders = new Map();

    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create demo orders
    const order1: Order = {
      id: "ORD-001",
      buyerName: "Fashion Forward Inc.",
      styleNumber: "FF-2024-001",
      quantity: 1000,
      estimatedDelivery: new Date("2024-03-15"),
      buyerEmail: "orders@fashionforward.com",
      status: "in_production",
      createdAt: new Date("2024-01-10"),
    };

    const order2: Order = {
      id: "ORD-002",
      buyerName: "Retail Chain Co.",
      styleNumber: "RC-SS24-015",
      quantity: 2500,
      estimatedDelivery: new Date("2024-02-28"),
      buyerEmail: "purchasing@retailchain.com",
      status: "quality_check",
      createdAt: new Date("2024-01-05"),
    };

    this.orders.set(order1.id, order1);
    this.orders.set(order2.id, order2);

    // Seed some demo updates and comments
    const update1: Update = {
      id: "update-1",
      orderId: "ORD-001",
      message: "Production has started. Fabric cutting is complete.",
      authorName: "Sarah Chen",
      authorRole: "manufacturer",
      createdAt: new Date("2024-01-12"),
    };

    const comment1: Comment = {
      id: "comment-1",
      orderId: "ORD-001", 
      message: "Looking great! Can we get photos of the fabric quality?",
      authorName: "Mike Johnson",
      authorRole: "buyer",
      createdAt: new Date("2024-01-13"),
    };

    this.updates.set(update1.id, update1);
    this.comments.set(comment1.id, comment1);

    // Seed some demo stakeholders
    const stakeholder1: Stakeholder = {
      id: "stakeholder-1",
      orderId: "ORD-001",
      name: "Sarah Chen",
      email: "sarah.chen@garmentfactory.com",
      role: "factory_manager",
      permissions: "update",
      createdAt: new Date("2024-01-10"),
    };

    const stakeholder2: Stakeholder = {
      id: "stakeholder-2",
      orderId: "ORD-001",
      name: "Mike Johnson",
      email: "mike.johnson@fashionforward.com",
      role: "buyer",
      permissions: "comment",
      createdAt: new Date("2024-01-10"),
    };

    this.stakeholders.set(stakeholder1.id, stakeholder1);
    this.stakeholders.set(stakeholder2.id, stakeholder2);
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      ...insertOrder,
      status: insertOrder.status || "received",
      createdAt: new Date(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = {
      ...order,
      status,
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Updates
  async getUpdatesByOrder(orderId: string): Promise<Update[]> {
    return Array.from(this.updates.values())
      .filter(update => update.orderId === orderId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createUpdate(insertUpdate: InsertUpdate): Promise<Update> {
    const id = randomUUID();
    const update: Update = {
      ...insertUpdate,
      id,
      createdAt: new Date(),
    };
    this.updates.set(id, update);
    return update;
  }

  // Comments
  async getCommentsByOrder(orderId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.orderId === orderId)
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

  // Stakeholders
  async getStakeholdersByOrder(orderId: string): Promise<Stakeholder[]> {
    return Array.from(this.stakeholders.values())
      .filter(stakeholder => stakeholder.orderId === orderId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createStakeholder(insertStakeholder: InsertStakeholder): Promise<Stakeholder> {
    const id = randomUUID();
    const stakeholder: Stakeholder = {
      ...insertStakeholder,
      id,
      createdAt: new Date(),
    };
    this.stakeholders.set(id, stakeholder);
    return stakeholder;
  }

  async deleteStakeholder(id: string): Promise<boolean> {
    return this.stakeholders.delete(id);
  }

  async updateStakeholderPermissions(id: string, permissions: string): Promise<Stakeholder | undefined> {
    const stakeholder = this.stakeholders.get(id);
    if (stakeholder) {
      stakeholder.permissions = permissions;
      this.stakeholders.set(id, stakeholder);
      return stakeholder;
    }
    return undefined;
  }
}

export const storage = new MemStorage();