import { type Order, type InsertOrder, type Update, type InsertUpdate } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private updates: Map<string, Update>;

  constructor() {
    this.orders = new Map();
    this.updates = new Map();
    
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
}

export const storage = new MemStorage();
