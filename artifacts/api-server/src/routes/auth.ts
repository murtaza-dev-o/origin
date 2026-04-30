import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createSession,
  destroySession,
  publicUser,
  setSessionCookie,
} from "../lib/auth";

const router: IRouter = Router();

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  res.json({ user: publicUser(req.user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  await db
    .update(usersTable)
    .set({ lastActiveAt: new Date() })
    .where(eq(usersTable.id, user.id));
  const token = await createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = (req.cookies && req.cookies[SESSION_COOKIE]) as string | undefined;
  if (token) {
    try {
      await destroySession(token);
    } catch {
      /* ignore */
    }
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;
