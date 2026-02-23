import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../drizzle/schema";
import { eq, gte, asc, desc, sql, count, inArray } from "drizzle-orm";

const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_DATABASE,
});

export const db = drizzle(client, { schema });

// === Usuários / Perfil ===
export async function upsertUser(user: any) {
    const roleMap: Record<string, any> = {
        "ADMIN": "ADMIN",
        "SECRETARY": "SECRETARY",
        "FINANCE": "FINANCE",
        "MEMBER": "MEMBER",
        "COORDENADOR": "COORDENADOR",
        "VICE_COORDENADOR": "VICE_COORDENADOR",
        "CELEBRANTE": "CELEBRANTE"
    };

    const existing = await getUserByClerkId(user.id);
    const existingRole = existing?.role;

    const finalRole = roleMap[user.role] ?? (existingRole ?? "MEMBER");

    console.log("[DB] Upserting user:", user.email, "Final Role:", finalRole);

    const values = {
        id: user.id,
        name: user.name,
        email: user.email || "",
        role: finalRole,
        phone: user.phone,
        status: user.status || "ativo",
        address: user.address,
        birthDate: user.birthDate,
        maritalStatus: user.maritalStatus,
        spouseName: user.spouseName,
        weddingDate: user.weddingDate,
        hasChildren: user.hasChildren,
        childrenData: user.childrenData,
        sacraments: user.sacraments,
        photoUrl: user.photoUrl,
    };

    return await db.insert(schema.users).values(values).onConflictDoUpdate({
        target: schema.users.id,
        set: values,
    });
}

export async function getUserByClerkId(clerkId: string) {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, clerkId)).limit(1);
    return result[0];
}

// === Membros da Pastoral ===
export async function listPastoralMembers() {
    return await db.select().from(schema.users).orderBy(asc(schema.users.name));
}

export async function updateUser(id: string, data: any) {
    console.log("[DB] Updating user:", id, "Data:", JSON.stringify(data));
    return await db.update(schema.users).set(data).where(eq(schema.users.id, id));
}

export async function deleteUser(id: string) {
    console.log("[DB] Deleting user:", id);
    return await db.delete(schema.users).where(eq(schema.users.id, id));
}

// === Agenda (Eventos Gerais) ===
export async function listAgendaEvents() {
    return await db.select().from(schema.events).orderBy(asc(schema.events.date));
}

export const listGeneralEvents = listAgendaEvents;

export async function createGeneralEvent(data: any) {
    return await db.insert(schema.events).values(data);
}

export async function updateGeneralEvent(id: number, data: any) {
    return await db.update(schema.events).set(data).where(eq(schema.events.id, id));
}

// === Agenda Unificada ===
export async function listAllAgendaItems() {
    const [events, meetingsRes, baptisms, formations] = await Promise.all([
        db.select().from(schema.events).where(sql`status != 'Cancelado'`),
        db.select({
            id: schema.minutes.id,
            meetingDate: schema.minutes.meetingDate,
            meetingTime: schema.minutes.meetingTime,
            title: schema.minutes.title,
            type: schema.minutes.type,
            location: schema.minutes.location,
            responsibleName: schema.users.name,
        }).from(schema.minutes).leftJoin(schema.users, eq(schema.minutes.responsibleId, schema.users.id)),
        db.select().from(schema.baptisms).where(sql`scheduled_date IS NOT NULL AND status != 'Cancelado'`),
        db.select().from(schema.formations)
    ]);

    const meetings = meetingsRes;

    const mappedEvents = events.map(e => ({
        id: `event-${e.id}`,
        originalId: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        type: 'Evento',
        status: e.status
    }));

    const mappedMeetings = meetings.map(m => ({
        id: `meeting-${m.id}`,
        originalId: m.id,
        title: m.title || "Reunião de Equipe",
        date: m.meetingDate,
        time: m.meetingTime,
        location: m.location,
        type: 'Reunião',
        category: m.type,
        responsibleName: m.responsibleName
    }));

    const mappedBaptisms = baptisms.map(b => ({
        id: `baptism-${b.id}`,
        originalId: b.id,
        title: `Batismo: ${b.childName}`,
        date: b.scheduledDate,
        time: "09:00", // Default para batismos
        location: "Igreja Matriz",
        type: 'Batismo',
        status: b.status
    }));

    const mappedFormations = formations.map(f => ({
        id: `formation-${f.id}`,
        originalId: f.id,
        title: f.title,
        date: f.date,
        time: "19:30", // Default para formações
        location: "Salão Paroquial",
        type: 'Formação',
        facilitator: f.facilitator || f.facilitator // Ensuring it's passed
    }));

    return [...mappedEvents, ...mappedMeetings, ...mappedBaptisms, ...mappedFormations].sort((a, b) =>
        (a.date || "").localeCompare(b.date || "")
    );
}

export async function deleteGeneralEvent(id: number) {
    return await db.delete(schema.events).where(eq(schema.events.id, id));
}

// === Batismos ===
export async function listBaptisms() {
    const baptisms = await db.select().from(schema.baptisms).orderBy(desc(schema.baptisms.id));
    console.log("[DB] listBaptisms found:", baptisms.length, "records");

    if (baptisms.length === 0) return [];

    const baptismIds = baptisms.map(b => b.id);

    // Busca agentes escalados para esses batismos
    const schedules = await db.select({
        id: schema.schedules.id,
        baptismId: schema.schedules.baptismId,
        userId: schema.users.id,
        userName: schema.users.name,
        userRole: schema.users.role,
        ceremonyRole: schema.schedules.role,
        presenceStatus: schema.schedules.presenceStatus
    })
        .from(schema.schedules)
        .innerJoin(schema.users, eq(schema.schedules.userId, schema.users.id))
        .where(inArray(schema.schedules.baptismId, baptismIds));

    const agentsMap: Record<number, any[]> = {};
    schedules.forEach((row: any) => {
        const bId = Number(row.baptismId);
        if (!agentsMap[bId]) agentsMap[bId] = [];
        agentsMap[bId].push({
            id: row.userId,
            name: row.userName,
            role: row.userRole,
            ceremonyRole: row.ceremonyRole,
            presenceStatus: row.presenceStatus
        });
    });

    return baptisms.map(row => ({
        id: row.id,
        childName: row.childName,
        parentNames: row.parentNames,
        godparentsNames: row.godparentsNames,
        status: row.status,
        date: row.date,
        scheduledDate: row.scheduledDate,
        celebrantId: row.celebrantId,
        courseDone: row.courseDone,
        docsOk: row.docsOk,
        observations: row.observations,
        gender: row.gender,
        age: row.age,
        city: row.city,
        agents: agentsMap[row.id] || []
    }));
}

export async function createBaptism(data: any) {
    return await db.insert(schema.baptisms).values(data);
}

export async function listUniqueCities() {
    const result = await db.select({ city: schema.baptisms.city })
        .from(schema.baptisms)
        .where(sql`${schema.baptisms.city} IS NOT NULL AND ${schema.baptisms.city} != ''`)
        .groupBy(schema.baptisms.city)
        .orderBy(asc(schema.baptisms.city));
    return result.map(row => row.city);
}

export async function updateBaptism(id: number, data: any) {
    return await db.update(schema.baptisms).set(data).where(eq(schema.baptisms.id, id));
}

export async function deleteBaptism(id: number) {
    // Delete associated schedules first to avoid foreign key constraints
    await db.delete(schema.schedules).where(eq(schema.schedules.baptismId, id));
    return await db.delete(schema.baptisms).where(eq(schema.baptisms.id, id));
}

// === Financeiro ===
export async function listTransactions() {
    return await db.select().from(schema.finance).orderBy(desc(schema.finance.date));
}

export async function createTransaction(data: any) {
    return await db.insert(schema.finance).values(data);
}

export async function updateTransaction(id: number, data: any) {
    return await db.update(schema.finance).set(data).where(eq(schema.finance.id, id));
}

export async function deleteTransaction(id: number) {
    return await db.delete(schema.finance).where(eq(schema.finance.id, id));
}

export async function getFinanceBI() {
    const transactions = await db.select().from(schema.finance).orderBy(asc(schema.finance.date));

    const monthlyData: Record<string, { entry: number, exit: number, balance: number }> = {};
    transactions.forEach(t => {
        const dateStr = String(t.date || "");
        const month = dateStr.substring(0, 7); // YYYY-MM
        const valueNum = Number(t.value || 0);

        if (!monthlyData[month]) {
            monthlyData[month] = { entry: 0, exit: 0, balance: 0 };
        }
        if (t.type === "entrada") {
            monthlyData[month].entry += valueNum;
        } else {
            monthlyData[month].exit += valueNum;
        }
        monthlyData[month].balance = monthlyData[month].entry - monthlyData[month].exit;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
}

// === Atas de Reunião (Minutes) ===
export async function listMeetings() {
    return await db.select({
        id: schema.minutes.id,
        title: schema.minutes.title,
        type: schema.minutes.type,
        responsibleId: schema.minutes.responsibleId,
        responsibleName: schema.users.name,
        meetingDate: schema.minutes.meetingDate,
        meetingTime: schema.minutes.meetingTime,
        location: schema.minutes.location,
        content: schema.minutes.content,
        fileUrl: schema.minutes.fileUrl
    })
        .from(schema.minutes)
        .leftJoin(schema.users, eq(schema.minutes.responsibleId, schema.users.id))
        .orderBy(desc(schema.minutes.meetingDate));
}

export async function createMeeting(data: any) {
    const cleanData: any = {
        meetingDate: data.meetingDate,
        meetingTime: data.meetingTime,
        title: data.title,
        type: data.type,
        responsibleId: data.responsibleId,
        location: data.location,
        content: data.content,
        fileUrl: data.fileUrl,
        authorId: data.authorId
    };

    console.log("[DB] Creating Meeting:", JSON.stringify(cleanData));

    try {
        return await db.insert(schema.minutes).values(cleanData);
    } catch (error) {
        console.error("[DB] Error creating meeting:", error);
        throw error;
    }
}

export async function updateMeeting(id: number, data: any) {
    const cleanData: any = {};
    if (data.meetingDate !== undefined) cleanData.meetingDate = data.meetingDate;
    if (data.meetingTime !== undefined) cleanData.meetingTime = data.meetingTime;
    if (data.title !== undefined) cleanData.title = data.title;
    if (data.type !== undefined) cleanData.type = data.type;
    if (data.responsibleId !== undefined) cleanData.responsibleId = data.responsibleId;
    if (data.location !== undefined) cleanData.location = data.location;
    if (data.content !== undefined) cleanData.content = data.content;
    if (data.fileUrl !== undefined) cleanData.fileUrl = data.fileUrl;

    console.log("[DB] UpdateMeeting - ID:", id, "CleanData:", JSON.stringify(cleanData));

    try {
        const result = await db.update(schema.minutes).set(cleanData).where(eq(schema.minutes.id, id));
        console.log("[DB] UpdateMeeting Success! Result:", JSON.stringify(result));
        return result;
    } catch (error) {
        console.error("[DB] UpdateMeeting CRITICAL ERROR:", error);
        throw error;
    }
}

export async function deleteMeeting(id: number) {
    return await db.delete(schema.minutes).where(eq(schema.minutes.id, id));
}

// === Arquivos & Templates (Uploads) ===
export async function listUploads() {
    return await db.select().from(schema.uploads).orderBy(desc(schema.uploads.createdAt));
}

export async function createUpload(data: any) {
    return await db.insert(schema.uploads).values(data);
}

export async function deleteUpload(id: number) {
    return await db.delete(schema.uploads).where(eq(schema.uploads.id, id));
}

// === Formações ===
export async function listFormations() {
    return await db.select().from(schema.formations).orderBy(desc(schema.formations.date));
}

export async function createFormation(data: any) {
    return await db.insert(schema.formations).values(data);
}

export async function updateFormation(id: number, data: any) {
    console.log("[DB] Update Formation ID:", id, "Data:", JSON.stringify(data));
    return await db.update(schema.formations).set(data).where(eq(schema.formations.id, id));
}

export async function deleteFormation(id: number) {
    return await db.delete(schema.formations).where(eq(schema.formations.id, id));
}

// === Pedidos / Solicitações ===
export async function listRequests() {
    return await db.select().from(schema.requests).orderBy(desc(schema.requests.createdAt));
}

export async function createRequest(data: any) {
    return await db.insert(schema.requests).values(data);
}

export async function updateRequest(id: number, data: any) {
    return await db.update(schema.requests).set(data).where(eq(schema.requests.id, id));
}

export async function deleteRequest(id: number) {
    return await db.delete(schema.requests).where(eq(schema.requests.id, id));
}

export async function updateRequestStatus(id: number, status: string) {
    return await db.update(schema.requests).set({ status }).where(eq(schema.requests.id, id));
}

// === Comunicação ===
export async function listCommunications() {
    return await db.select().from(schema.communications).orderBy(desc(schema.communications.date));
}

export async function createCommunication(data: any) {
    return await db.insert(schema.communications).values(data);
}

export async function updateCommunication(id: number, data: any) {
    return await db.update(schema.communications).set(data).where(eq(schema.communications.id, id));
}

export async function deleteCommunication(id: number) {
    return await db.delete(schema.communications).where(eq(schema.communications.id, id));
}

// === Dashboard & BI Queries ===
export async function getDashboardSummary() {
    const nowLocal = new Date(new Date().getTime() - (3 * 60 * 60 * 1000)).toISOString().split('T')[0];

    try {
        const [nextBap] = await db.select()
            .from(schema.baptisms)
            .where(sql`COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}) >= ${nowLocal} AND ${schema.baptisms.status} != 'Cancelado'`)
            .orderBy(asc(sql`COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date})`))
            .limit(1);

        const [nextMeet] = await db.select()
            .from(schema.minutes)
            .where(gte(schema.minutes.meetingDate, nowLocal))
            .orderBy(asc(schema.minutes.meetingDate))
            .limit(1);

        const [nextEve] = await db.select()
            .from(schema.events)
            .where(sql`${schema.events.date} >= ${nowLocal} AND ${schema.events.status} != 'Cancelado'`)
            .orderBy(asc(schema.events.date))
            .limit(1);

        const commCount = await db.select({ total: count() }).from(schema.communications);

        return {
            nextBaptism: nextBap ? {
                id: nextBap.id,
                childName: nextBap.childName || "Sem Nome",
                date: (nextBap.scheduledDate || nextBap.date || "").split('T')[0],
                docsOk: nextBap.docsOk
            } : null,
            nextMeeting: nextMeet ? {
                id: nextMeet.id,
                title: nextMeet.title || "Reunião Pastoral",
                meetingDate: (nextMeet.meetingDate || "").split('T')[0],
                location: nextMeet.location,
                meetingTime: nextMeet.meetingTime,
                type: nextMeet.type
            } : null,
            nextEvent: nextEve ? {
                id: nextEve.id,
                title: nextEve.title,
                date: (nextEve.date || "").split('T')[0],
                location: nextEve.location
            } : null,
            notificationsCount: commCount[0].total
        };
    } catch (error: any) {
        console.error("[DASH_LOG] Error:", error.message);
        throw error;
    }
}

export async function getPresenceScale() {
    const nowLocal = new Date(new Date().getTime() - (3 * 60 * 60 * 1000)).toISOString().split('T')[0];

    try {
        const baptisms = await db.select({
            id: schema.baptisms.id,
            childName: schema.baptisms.childName,
            date: schema.baptisms.date,
            scheduledDate: schema.baptisms.scheduledDate,
            docsOk: schema.baptisms.docsOk
        })
            .from(schema.baptisms)
            .where(sql`COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}) >= ${nowLocal} AND ${schema.baptisms.status} != 'Cancelado'`)
            .orderBy(asc(sql`COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date})`));

        if (baptisms.length === 0) return [];

        const baptismIds = baptisms.map(b => b.id);

        const schedules = await db.select({
            id: schema.schedules.id,
            baptismId: schema.schedules.baptismId,
            userId: schema.users.id,
            userName: schema.users.name,
            userRole: schema.users.role,
            ceremonyRole: schema.schedules.role,
            presenceStatus: schema.schedules.presenceStatus
        })
            .from(schema.schedules)
            .innerJoin(schema.users, eq(schema.schedules.userId, schema.users.id))
            .where(inArray(schema.schedules.baptismId, baptismIds));

        const schedulesMap: Record<number, any[]> = {};
        schedules.forEach((row: any) => {
            const bId = Number(row.baptismId);
            if (!schedulesMap[bId]) schedulesMap[bId] = [];
            schedulesMap[bId].push(row);
        });

        return baptisms.map((baptism: any) => ({
            baptism: {
                id: baptism.id,
                childName: baptism.childName || "Sem Nome",
                date: (baptism.scheduledDate || baptism.date || "").split('T')[0],
                docsOk: baptism.docsOk
            },
            members: schedulesMap[baptism.id] || []
        }));
    } catch (error) {
        console.error("[SCALE_DEBUG] Error:", error);
        throw error;
    }
}

export async function updatePresenceStatus(scheduleId: number, status: "confirmado" | "ausente" | "pendente") {
    return await db.update(schema.schedules).set({ presenceStatus: status }).where(eq(schema.schedules.id, scheduleId));
}

export async function addToScale(baptismId: number, userId: string, role?: string) {
    return await db.insert(schema.schedules).values({
        baptismId,
        userId,
        role: role || "Equipe",
        presenceStatus: "pendente"
    }).returning();
}

export async function removeFromScale(scheduleId: number) {
    return await db.delete(schema.schedules).where(eq(schema.schedules.id, scheduleId));
}

export async function getEvolutionData(filters?: { gender?: string, city?: string, year?: string, ageGroup?: string }) {
    const whereConditions = [];

    // Filter out records from before 2026 (start of the project) as per user request
    const startYear = filters?.year || "2026";
    whereConditions.push(sql`strftime('%Y', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date})) = ${startYear}`);

    if (filters?.ageGroup === "child") {
        whereConditions.push(sql`(${schema.baptisms.age} = 0 OR ${schema.baptisms.age} IS NULL)`);
    } else if (filters?.ageGroup === "adult") {
        whereConditions.push(sql`${schema.baptisms.age} = 1`);
    }

    if (filters?.gender) {
        whereConditions.push(eq(schema.baptisms.gender, filters.gender as any));
    }
    if (filters?.city) {
        whereConditions.push(eq(schema.baptisms.city, filters.city));
    }

    const result = await db.select({
        monthNum: sql<string>`strftime('%m', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`,
        yearNum: sql<string>`strftime('%Y', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`,
        count: count()
    })
        .from(schema.baptisms)
        .where(sql.join(whereConditions, sql` AND `))
        .groupBy(
            sql`strftime('%Y', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`,
            sql`strftime('%m', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`
        )
        .orderBy(
            asc(sql`strftime('%Y', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`),
            asc(sql`strftime('%m', COALESCE(${schema.baptisms.scheduledDate}, ${schema.baptisms.date}))`)
        );

    const monthsMap: Record<string, string> = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
        '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    return result.map((row: any) => ({
        name: `${monthsMap[row.monthNum]} ${row.yearNum.slice(2)}`,
        quantity: row.count,
        year: Number(row.yearNum)
    }));
}

// === Configurações ===
export async function getConfig(key: string, defaultValue: string): Promise<string> {
    try {
        const result = await db.select().from(schema.configs).where(eq(schema.configs.key, key)).limit(1);
        return result[0]?.value ?? defaultValue;
    } catch (e) {
        console.error("[DB] Error getting config:", key, e);
        return defaultValue;
    }
}

export async function setConfig(key: string, value: string) {
    const values = { key, value, updatedAt: new Date().toISOString() };
    return await db.insert(schema.configs).values(values).onConflictDoUpdate({
        target: schema.configs.key,
        set: { value: values.value, updatedAt: values.updatedAt }
    });
}
