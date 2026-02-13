import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Tabela de Usuários (Integrada com Clerk)
export const users = sqliteTable("users", {
    id: text("id").primaryKey(), // ID do Clerk
    role: text("role", { enum: ["ADMIN", "SECRETARY", "FINANCE", "MEMBER"] }).notNull().default("MEMBER"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    status: text("status").notNull().default("Ativo"), // Ativo, Inativo, etc
});

// Tabela de Batismos
export const baptisms = sqliteTable("baptisms", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status", {
        enum: ["Solicitado", "Em Triagem", "Agendado", "Concluído"]
    }).notNull().default("Solicitado"),
    date: text("date"), // ISO string
    celebrantId: text("celebrant_id").references(() => users.id),
    courseDone: integer("course_done", { mode: "boolean" }).notNull().default(false),
    docsOk: integer("docs_ok", { mode: "boolean" }).notNull().default(false),
    observations: text("observations"),
});

// Tabela de Escalas (Relacionamento entre usuários e batismos)
export const schedules = sqliteTable("schedules", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    baptismId: integer("baptism_id").notNull().references(() => baptisms.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role"), // Papel na cerimônia específica
});

// Tabela Financeiro
export const finance = sqliteTable("finance", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type", { enum: ["entrada", "saída"] }).notNull(),
    value: real("value").notNull(),
    description: text("description").notNull(),
    date: text("date").notNull(), // ISO string
    category: text("category"),
});

// Tabela de Atas
export const minutes = sqliteTable("minutes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    meetingDate: text("meeting_date").notNull(),
    content: text("content").notNull(), // Texto rico
    authorId: text("author_id").notNull().references(() => users.id),
});
