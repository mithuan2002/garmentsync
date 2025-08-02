import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  buyerName: text("buyer_name").notNull(),
  styleNumber: text("style_number").notNull(),
  quantity: integer("quantity").notNull(),
  estimatedDelivery: timestamp("estimated_delivery").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  status: text("status").notNull().default("received"), // 'received' | 'in_production' | 'quality_check' | 'shipped' | 'delivered'
  createdAt: timestamp("created_at").defaultNow(),
});

export const updates = pgTable("updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  message: text("message").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(), // 'manufacturer' | 'buyer'
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  message: text("message").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(), // 'manufacturer' | 'buyer'
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertOrderSchema = z.object({
  id: z.string().min(1),
  buyerName: z.string().min(1),
  styleNumber: z.string().min(1),
  quantity: z.number().int().positive(),
  estimatedDelivery: z.union([z.date(), z.string().datetime()]).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }),
  buyerEmail: z.string().email(),
  status: z.string().optional(),
});

export const insertUpdateSchema = z.object({
  orderId: z.string().min(1),
  message: z.string().min(1),
  authorName: z.string().min(1),
  authorRole: z.enum(['manufacturer', 'buyer']),
});

export const insertCommentSchema = z.object({
  orderId: z.string().min(1),
  message: z.string().min(1),
  authorName: z.string().min(1),
  authorRole: z.enum(['manufacturer', 'buyer']),
});

// Types
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
