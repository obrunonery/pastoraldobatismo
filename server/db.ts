import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../drizzle/schema";
import { eq, gte, asc, desc, sql, count } from "drizzle-orm";

const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_DATABASE,
});

export const db = drizzle(client, { schema });

// === Usuários / Perfil ===
export async function upsertUser(user: any) {
    const adminEmails = ["lbrunonery@gmail.com"];
    const isAdminEmail = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;

    const roleMap: Record<string, any> = {
        "ADMIN": "ADMIN",
        "SECRETARY": "SECRETARY",
        "FINANCE": "FINANCE",
        "MEMBER": "MEMBER",
        "COORDENADOR": "COORDENADOR",
        "VICE_COORDENADOR": "VICE_COORDENADOR",
        "CELEBRANTE": "CELEBRANTE"
    };

    const finalRole = roleMap[user.role] ?? (isAdminEmail ? "ADMIN" : "MEMBER");

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
    const result = await client.execute('SELECT * FROM events ORDER BY date ASC');
    return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        time: row.time,
        location: row.location,
        description: row.description,
        status: row.status
    }));
}

export const listGeneralEvents = listAgendaEvents;

export async function createGeneralEvent(data: any) {
    return await db.insert(schema.events).values(data);
}

export async function updateGeneralEvent(id: number, data: any) {
    return await db.update(schema.events).set(data).where(eq(schema.events.id, id));
}

export async function deleteGeneralEvent(id: number) {
    return await db.delete(schema.events).where(eq(schema.events.id, id));
}

// === Batismos ===
export async function listBaptisms() {
    const result = await client.execute('SELECT * FROM baptisms ORDER BY id DESC');
    return result.rows.map((row: any) => ({
        id: row.id,
        childName: row.child_name || row.childName,
        parentNames: row.parent_names || row.parentNames,
        godparentsNames: row.godparents_names || row.godparentsNames,
        status: row.status,
        date: row.date,
        scheduledDate: row.scheduled_date || row.scheduledDate,
        celebrantId: row.celebrant_id || row.celebrantId,
        courseDone: Boolean(row.course_done || row.courseDone),
        docsOk: Boolean(row.docs_ok || row.docsOk),
        observations: row.observations,
        gender: row.gender,
        age: row.age,
        city: row.city
    }));
}

export async function createBaptism(data: any) {
    return await db.insert(schema.baptisms).values(data);
}

export async function listUniqueCities() {
    const result = await client.execute("SELECT DISTINCT city FROM baptisms WHERE city IS NOT NULL AND city != '' ORDER BY city ASC");
    return result.rows.map((row: any) => row.city);
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
    const result = await client.execute('SELECT * FROM finance ORDER BY date DESC');
    return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        value: row.value,
        type: row.type,
        category: row.category,
        description: row.description
    }));
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
    const result = await client.execute('SELECT * FROM finance ORDER BY date ASC');
    const transactions = result.rows;

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
    const result = await client.execute(`
        SELECT 
            m.id,
            m.meeting_date,
            m.meeting_time,
            m.title,
            m.type,
            m.responsible_id,
            m.location,
            m.content,
            m.file_url,
            m.author_id,
            u.name as responsibleName 
        FROM minutes m 
        LEFT JOIN users u ON m.responsible_id = u.id 
        ORDER BY m.meeting_date DESC
    `);
    return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        responsibleId: row.responsible_id || row.responsibleId,
        responsibleName: row.responsibleName || "Coordenação",
        meetingDate: row.meeting_date || row.meetingDate,
        meetingTime: row.meeting_time || row.meetingTime,
        location: row.location,
        content: row.content,
        participants: row.participants,
        fileUrl: row.file_url || row.fileUrl
    }));
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

    console.log("[DB] Updating Meeting:", id, "CleanData:", JSON.stringify(cleanData));

    try {
        return await db.update(schema.minutes).set(cleanData).where(eq(schema.minutes.id, id));
    } catch (error) {
        console.error("[DB] Error updating meeting:", error);
        throw error;
    }
}

export async function deleteMeeting(id: number) {
    return await db.delete(schema.minutes).where(eq(schema.minutes.id, id));
}

// === Arquivos & Templates (Uploads) ===
export async function listUploads() {
    const result = await client.execute('SELECT * FROM uploads ORDER BY created_at DESC');
    return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        filename: row.filename,
        url: row.url,
        category: row.category,
        createdAt: row.created_at || row.createdAt
    }));
}

export async function createUpload(data: any) {
    return await db.insert(schema.uploads).values(data);
}

export async function deleteUpload(id: number) {
    return await db.delete(schema.uploads).where(eq(schema.uploads.id, id));
}

// === Formações ===
export async function listFormations() {
    // Força bruta: lendo diretamente as colunas como strings para ignorar qualquer mapeamento do driver/ORM
    const result = await client.execute('SELECT id, title, date, content, file_url, facilitator FROM formations ORDER BY date DESC');
    return result.rows.map((row: any) => ({
        id: row['id'],
        title: row['title'],
        date: row['date'],
        facilitator: row['facilitator'] || "",
        content: row['content'] || "",
        fileUrl: row['file_url'] || ""
    }));
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
    console.log(`[DASH_LOG] Ref Date: ${nowLocal}`);

    try {
        const bapRes = await client.execute("SELECT * FROM baptisms");
        const meetRes = await client.execute("SELECT * FROM minutes");
        const eveRes = await client.execute("SELECT * FROM events");
        const commRes = await client.execute("SELECT COUNT(*) as total FROM communications");

        const getFirstFuture = (rows: any[], dateField: string, altDateField?: string) => {
            return rows
                .map(r => ({ ...r, _date: (r[dateField] || r[altDateField || ""] || r.date || "").split('T')[0] }))
                .filter(r => r._date && r._date >= nowLocal)
                .sort((a, b) => a._date.localeCompare(b._date))[0];
        };

        const nextBap = getFirstFuture(bapRes.rows, 'scheduled_date', 'scheduledDate');
        const nextMeet = getFirstFuture(meetRes.rows, 'meeting_date', 'meetingDate');
        const nextEve = getFirstFuture(eveRes.rows, 'date');

        console.log(`[DASH_LOG] Found -> Bap: ${nextBap?._date}, Meet: ${nextMeet?._date}, Eve: ${nextEve?._date}`);

        const notificationsCount = Number(commRes.rows[0]?.total ?? commRes.rows[0]?.TOTAL ?? 0);

        return {
            nextBaptism: nextBap ? {
                id: Number(nextBap.id),
                childName: nextBap.child_name || nextBap.childName || "Sem Nome",
                date: nextBap._date,
                docsOk: Boolean(nextBap.docs_ok || nextBap.docsOk)
            } : null,
            nextMeeting: nextMeet ? {
                id: Number(nextMeet.id),
                title: nextMeet.title || "Reunião Pastoral (DEBUG)",
                meetingDate: nextMeet._date,
                location: nextMeet.location,
                meetingTime: nextMeet.meeting_time || nextMeet.meetingTime
            } : null,
            nextEvent: nextEve ? {
                id: Number(nextEve.id),
                title: nextEve.title,
                date: nextEve._date,
                location: nextEve.location
            } : null,
            notificationsCount
        };
    } catch (error: any) {
        console.error("[DASH_LOG] Error:", error.message);
        throw error;
    }
}

export async function getPresenceScale() {
    const now = new Date(new Date().getTime() - (3 * 60 * 60 * 1000)).toISOString().split('T')[0];

    try {
        const baptismsRes = await client.execute("SELECT * FROM baptisms");
        const upcomingBaptisms = baptismsRes.rows
            .map((b: any) => ({
                ...b,
                computedDate: (b.scheduled_date || b.scheduledDate || b.date || b.Date || "").split('T')[0]
            }))
            .filter((b: any) => b.computedDate && b.computedDate >= now)
            .sort((a, b) => a.computedDate.localeCompare(b.computedDate));

        if (upcomingBaptisms.length === 0) return [];

        const results = [];
        for (const baptism of upcomingBaptisms) {
            const scaleResult = await client.execute({
                sql: `
                    SELECT 
                        s.id,
                        u.id as userId,
                        u.name as userName,
                        u.role as userRole,
                        s.role as ceremonyRole,
                        s.presence_status as presenceStatus
                    FROM schedules s
                    INNER JOIN users u ON s.user_id = u.id
                    WHERE s.baptism_id = ?
                `,
                args: [baptism.id]
            });

            results.push({
                baptism: {
                    id: Number(baptism.id),
                    childName: baptism.child_name || baptism.childName || "Sem Nome",
                    date: baptism.computedDate,
                    docsOk: Boolean(baptism.docs_ok || baptism.docsOk)
                },
                members: scaleResult.rows
            });
        }

        return results;
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
    let query = `
        SELECT
            strftime('%m', COALESCE(scheduled_date, date)) as month_num,
            strftime('%Y', COALESCE(scheduled_date, date)) as year_num,
            COUNT(*) as count
        FROM baptisms
        WHERE 1=1
    `;
    const args: any[] = [];

    if (filters?.ageGroup === "child") {
        query += ` AND (age = 0 OR age IS NULL) `;
    } else if (filters?.ageGroup === "adult") {
        query += ` AND age = 1 `;
    }

    if (filters?.gender) {
        query += ` AND gender = ? `;
        args.push(filters.gender);
    }
    if (filters?.city) {
        query += ` AND city = ? `;
        args.push(filters.city);
    }

    if (filters?.year) {
        query += ` AND strftime('%Y', COALESCE(scheduled_date, date)) = ? `;
        args.push(filters.year);
    } else {
        // Filter out records from before 2026 (start of the project) as per user request
        query += ` AND strftime('%Y', COALESCE(scheduled_date, date)) >= '2026' `;
    }

    query += ` GROUP BY year_num, month_num ORDER BY year_num ASC, month_num ASC `;

    console.log("[EVOLUTION_DEBUG] Query:", query);
    console.log("[EVOLUTION_DEBUG] Args:", args);

    const result = await client.execute({ sql: query, args });
    const rows = result.rows;

    console.log("[EVOLUTION_DEBUG] Result Rows:", rows.length);

    const monthsMap: Record<string, string> = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
        '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    return rows.map((row: any) => ({
        name: `${monthsMap[row.month_num]} ${row.year_num.slice(2)}`,
        quantity: row.count,
        year: Number(row.year_num)
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
