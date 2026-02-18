import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Tabela de Usuários (Integrada com Clerk)
export const users = sqliteTable("users", {
    id: text("id").primaryKey(), // ID do Clerk
    role: text("role", { enum: ["ADMIN", "SECRETARY", "FINANCE", "MEMBER", "CELEBRANTE", "COORDENADOR", "VICE_COORDENADOR"] }).notNull().default("MEMBER"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    status: text("status").notNull().default("ativo"), // ativo, inativo, etc
    // Novos campos Equipe Pastoral
    birthDate: text("birth_date"), // DD/MM
    address: text("address"),
    maritalStatus: text("marital_status"), // Solteiro, Casado, etc
    spouseName: text("spouse_name"),
    weddingDate: text("wedding_date"), // DD/MM
    hasChildren: integer("has_children", { mode: "boolean" }).default(false),
    childrenData: text("children_data"), // JSON string: [{name, birth}]
    sacraments: text("sacraments"), // JSON string: {baptism, eucharist, confirmation, marriage}
    photoUrl: text("photo_url"),
});

// Tabela de Batismos
export const baptisms = sqliteTable("baptisms", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    childName: text("child_name").notNull().default(""),
    parentNames: text("parent_names"),
    godparentsNames: text("godparents_names"),
    status: text("status", {
        enum: ["Solicitado", "Em Triagem", "Agendado", "Concluído"]
    }).notNull().default("Solicitado"),
    date: text("date"), // ISO string (campo mantido para compatibilidade se necessário)
    scheduledDate: text("scheduled_date"), // ISO string - campo principal de data
    celebrantId: text("celebrant_id").references(() => users.id),
    courseDone: integer("course_done", { mode: "boolean" }).notNull().default(false),
    docsOk: integer("docs_ok", { mode: "boolean" }).notNull().default(false),
    observations: text("observations"),
    // Novos campos BI
    gender: text("gender", { enum: ["m", "f"] }),
    age: integer("age"),
    city: text("city"),
});

// Tabela de Escalas (Relacionamento entre usuários e batismos)
export const schedules = sqliteTable("schedules", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    baptismId: integer("baptism_id").notNull().references(() => baptisms.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role"), // Papel na cerimônia específica
    presenceStatus: text("presence_status", {
        enum: ["pendente", "confirmado", "ausente"]
    }).notNull().default("pendente"),
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
    meetingTime: text("meeting_time"),
    title: text("title"),
    type: text("type"), // New field for meeting type
    responsibleId: text("responsible_id").references(() => users.id), // New field for responsible member
    location: text("location"),
    content: text("content"), // Opcional agora que teremos PDF
    fileUrl: text("file_url"), // Link para o PDF da ata
    authorId: text("author_id").notNull().references(() => users.id),
});

// Tabela de Arquivos & Templates (Gerais)
export const uploads = sqliteTable("uploads", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    filename: text("filename").notNull(),
    url: text("url").notNull(),
    category: text("category").notNull().default("Template"), // Template, Guia, Manual, etc
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const formations = sqliteTable("formations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    date: text("date").notNull(),
    facilitator: text("facilitator"),
    content: text("content"),
    fileUrl: text("file_url"),
});

// Tabela de Eventos (Geral)
export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    date: text("date").notNull(),
    time: text("time"),
    location: text("location"),
    description: text("description"),
    status: text("status").notNull().default("Agendado"),
});

// Tabela de Pedidos / Solicitações
export const requests = sqliteTable("requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    type: text("type").notNull(), // pedido, ideia, compra, tarefa
    urgency: text("urgency").notNull().default("medium"), // low, medium, high
    description: text("description"),
    status: text("status").notNull().default("Pendente"),
    authorId: text("author_id").references(() => users.id),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabela de Comunicação
export const communications = sqliteTable("communications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    fileUrl: text("file_url"),
    date: text("date").notNull(),
    authorId: text("author_id").references(() => users.id),
});

// Tabela de Configurações Gerais
export const configs = sqliteTable("configs", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});
