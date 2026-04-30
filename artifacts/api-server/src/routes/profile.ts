import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  usersTable,
  achievementsTable,
  badgesTable,
} from "@workspace/db";
import { publicUser, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/profile/me", requireAuth, async (req, res): Promise<void> => {
  res.json(publicUser(req.user!));
});

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(desc(usersTable.xp));
  const items = rows.map((u, i) => ({
    userId: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    xp: u.xp,
    level: u.level,
    grade: u.grade,
    rank: i + 1,
  }));
  res.json({ items });
});

router.get("/gamification/me", requireAuth, async (req, res): Promise<void> => {
  const u = req.user!;
  const rows = await db
    .select({ a: achievementsTable, b: badgesTable })
    .from(achievementsTable)
    .innerJoin(badgesTable, eq(badgesTable.id, achievementsTable.badgeId))
    .where(eq(achievementsTable.userId, u.id));
  res.json({
    badges: rows.map((r) => ({
      id: r.a.id,
      userId: r.a.userId,
      badgeId: r.a.badgeId,
      earnedAt: r.a.earnedAt,
      badge: r.b,
    })),
    xp: u.xp,
    level: u.level,
    streak: u.streak,
  });
});

export default router;
