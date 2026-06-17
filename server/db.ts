import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, meetings, Meeting, InsertMeeting, companyProfiles, CompanyProfile, InsertCompanyProfile } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserMeetings(userId: number): Promise<Meeting[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get meetings: database not available");
    return [];
  }

  try {
    const result = await db.select().from(meetings).where(eq(meetings.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get meetings:", error);
    return [];
  }
}

export async function createMeeting(userId: number, data: { day: string; time: string; title: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create meeting: database not available");
    return null;
  }

  try {
    const result = await db.insert(meetings).values({
      userId,
      day: data.day,
      time: data.time,
      title: data.title,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create meeting:", error);
    throw error;
  }
}

export async function updateMeeting(meetingId: number, data: { day?: string; time?: string; title?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update meeting: database not available");
    return null;
  }

  try {
    const result = await db.update(meetings).set(data).where(eq(meetings.id, meetingId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update meeting:", error);
    throw error;
  }
}

export async function deleteMeeting(meetingId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete meeting: database not available");
    return null;
  }

  try {
    const result = await db.delete(meetings).where(eq(meetings.id, meetingId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete meeting:", error);
    throw error;
  }
}

export async function getCompanyProfile(userId: number): Promise<CompanyProfile | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get company profile: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get company profile:", error);
    return undefined;
  }
}

export async function createCompanyProfile(userId: number, data: { companyName: string; companyDescription: string; selectedAgents: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create company profile: database not available");
    return null;
  }

  try {
    const result = await db.insert(companyProfiles).values({
      userId,
      companyName: data.companyName,
      companyDescription: data.companyDescription,
      selectedAgents: data.selectedAgents,
      isOnboarded: 1,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create company profile:", error);
    throw error;
  }
}

export async function updateCompanyProfile(userId: number, data: { companyName?: string; companyDescription?: string; selectedAgents?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update company profile: database not available");
    return null;
  }

  try {
    const result = await db.update(companyProfiles).set(data).where(eq(companyProfiles.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update company profile:", error);
    throw error;
  }
}
