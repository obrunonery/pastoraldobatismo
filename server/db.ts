import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";

const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_DATABASE,
});

export const db = drizzle(client, { schema });

// Reuniões (Atas)
export async function listMeetings() {
    return await db.query.minutes.findMany({
        orderBy: (minutes, { desc }) => [desc(minutes.meetingDate)],
    });
}

// Funções de Auxílio (Baseadas no seu código original, mas adaptadas)
export async function upsertUser(user: { id: string; name: string; email: string; role?: "ADMIN" | "SECRETARY" | "FINANCE" | "MEMBER"; phone?: string }) {
    const adminEmails = ["lbrunonery@gmail.com"];
    const isAdminEmail = adminEmails.includes(user.email.toLowerCase());
    const finalRole = user.role ?? (isAdminEmail ? "ADMIN" : "MEMBER");

    console.log("[DB] Upserting user:", user.email, "Final Role:", finalRole);

    return await db.insert(schema.users).values({
        id: user.id,
        name: user.name,
        email: user.email,
        role: finalRole,
        phone: user.phone,
        status: "Ativo",
    }).onConflictDoUpdate({
        target: schema.users.id,
        set: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: finalRole,
        },
    });
}

export async function getUserByClerkId(clerkId: string) {
    console.log("[DB] Fetching user by Clerk ID:", clerkId);
    return await db.query.users.findFirst({
        where: eq(schema.users.id, clerkId),
    });
}

// Agenda Router
export async function listAgendaEvents() {
    return await db.query.baptisms.findMany({
        orderBy: (baptisms, { asc }) => [asc(baptisms.date)],
    });
}

// Financeiro
export async function listTransactions() {
    return await db.query.finance.findMany({
        orderBy: (finance, { desc }) => [desc(finance.date)],
    });
}

export async function createTransaction(data: any) {
    return await db.insert(schema.finance).values(data);
}

export async function deleteTransaction(id: number) {
    return await db.delete(schema.finance).where(eq(schema.finance.id, id));
}

// Batismos
export async function listBaptisms() {
    return await db.query.baptisms.findMany({
        orderBy: (baptisms, { desc }) => [desc(baptisms.id)],
    });
}
export async function listPastoralMembers() {
    return await db.query.users.findMany({
        orderBy: (users, { asc }) => [asc(users.name)],
    });
}

export async function updateUser(id: string, data: Partial<typeof schema.users.$inferInsert>) {
    return await db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id));
}

export async function deleteUser(id: string) {
    return await db.delete(schema.users)
        .where(eq(schema.users.id, id));
}
