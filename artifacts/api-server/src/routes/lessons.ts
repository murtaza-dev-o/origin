import { Router, type IRouter } from "express";
import { eq, and, asc, sql } from "drizzle-orm";
import {
  db,
  lessonsTable,
  coursesTable,
  lessonProgressTable,
  quizzesTable,
  quizAttemptsTable,
  usersTable,
  xpEventsTable,
} from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { levelForXp } from "../lib/level";

const router: IRouter = Router();

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const [l] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);
  if (!l) {
    res.json(null);
    return;
  }
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, l.courseId)).limit(1);
  const siblings = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, l.courseId))
    .orderBy(asc(lessonsTable.order));
  const idx = siblings.findIndex((x) => x.id === l.id);

  let completed = false;
  if (req.user) {
    const c = await db
      .select({ id: lessonProgressTable.id })
      .from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.userId, req.user.id), eq(lessonProgressTable.lessonId, l.id)))
      .limit(1);
    completed = c.length > 0;
  }
  const hasQuiz = (await db.select({ id: quizzesTable.id }).from(quizzesTable).where(eq(quizzesTable.lessonId, l.id)).limit(1)).length > 0;

  res.json({
    ...l,
    durationMinutes: l.durationMin,
    xpReward: 50,
    description: "",
    course: course ?? null,
    completed,
    hasQuiz,
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx < siblings.length - 1 ? siblings[idx + 1] : null,
  });
});

router.post("/courses/:id/lessons", requireAuth, async (req, res): Promise<void> => {
  const courseId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(courseId)) {
    res.status(400).json({ error: "Invalid course id." });
    return;
  }
  const d = req.body ?? {};
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${lessonsTable.order}), 0)::int` })
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, courseId));
  const [l] = await db
    .insert(lessonsTable)
    .values({
      courseId,
      title: d.title ?? "Untitled lesson",
      kind: d.kind === "video" ? "video" : "reading",
      durationMin: Number.isFinite(Number(d.durationMin)) ? Number(d.durationMin) : 10,
      videoUrl: d.videoUrl ?? null,
      content: d.content ?? null,
      order: maxOrder + 1,
    })
    .returning();
  res.status(201).json(l);
});

router.delete("/lessons/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const [removed] = await db.delete(lessonsTable).where(eq(lessonsTable.id, id)).returning();
  if (!removed) {
    res.status(404).json({ error: "Lesson not found." });
    return;
  }
  res.json({ ok: true });
});

router.post("/lessons/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const u = req.user!;
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found." });
    return;
  }
  const existing = await db
    .select({ id: lessonProgressTable.id })
    .from(lessonProgressTable)
    .where(and(eq(lessonProgressTable.userId, u.id), eq(lessonProgressTable.lessonId, id)))
    .limit(1);
  let xpAwarded = 0;
  let leveledUp = false;
  let newLevel = u.level;
  if (existing.length === 0) {
    await db.insert(lessonProgressTable).values({ userId: u.id, lessonId: id });
    xpAwarded = 50;
    const nextXp = u.xp + xpAwarded;
    const lvl = levelForXp(nextXp);
    leveledUp = lvl.level > u.level;
    newLevel = lvl.level;
    await db
      .update(usersTable)
      .set({ xp: nextXp, level: lvl.level, lastActiveAt: new Date() })
      .where(eq(usersTable.id, u.id));
    await db.insert(xpEventsTable).values({ userId: u.id, amount: xpAwarded, reason: "Lesson complete" });
  }
  res.json({ lessonId: id, xpAwarded, leveledUp, level: newLevel });
});

router.get("/lessons/:id/quiz", async (req, res): Promise<void> => {
  const lessonId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(lessonId)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const [q] = await db.select().from(quizzesTable).where(eq(quizzesTable.lessonId, lessonId)).limit(1);
  if (!q) {
    res.json(null);
    return;
  }
  const [l] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
  let questions: Array<{ id: number; text: string; choices: string[] }> = [];
  try {
    const parsed = JSON.parse(q.questions);
    if (Array.isArray(parsed)) {
      questions = parsed.map((qq: any) => ({ id: qq.id, text: qq.text, choices: qq.choices }));
    }
  } catch {
    /* ignore */
  }
  res.json({
    id: lessonId,
    lessonId,
    title: `${l?.title ?? "Lesson"} — Quiz`,
    xpReward: 20,
    questions,
  });
});

router.post("/lessons/:id/quiz/submit", requireAuth, async (req, res): Promise<void> => {
  const lessonId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(lessonId)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const [q] = await db.select().from(quizzesTable).where(eq(quizzesTable.lessonId, lessonId)).limit(1);
  if (!q) {
    res.status(404).json({ error: "Quiz not found." });
    return;
  }
  const u = req.user!;

  let questions: Array<{ id: number; text: string; choices: string[]; correct: number }> = [];
  try {
    const parsed = JSON.parse(q.questions);
    if (Array.isArray(parsed)) questions = parsed;
  } catch {
    questions = [];
  }
  const total = questions.length;
  if (total === 0) {
    res.json({ score: 0, correct: 0, total: 0, detail: [], xpAwarded: 0, leveledUp: false, level: u.level, passed: false });
    return;
  }

  const rawAns = req.body?.answers;
  const answersByQ: Record<number, number> = {};
  if (Array.isArray(rawAns)) {
    for (const a of rawAns) answersByQ[a.questionId] = a.choiceIndex;
  } else if (rawAns && typeof rawAns === "object") {
    for (const [k, v] of Object.entries(rawAns)) answersByQ[Number(k)] = v as number;
  }

  let correct = 0;
  const detail = questions.map((qq) => {
    const ans = answersByQ[qq.id];
    const ok = ans === qq.correct;
    if (ok) correct += 1;
    return { questionId: qq.id, correct: ok, correctIndex: qq.correct, chose: ans };
  });
  const score = Math.round((correct / total) * 100);

  await db.insert(quizAttemptsTable).values({ userId: u.id, lessonId, score });
  const xpAwarded = Math.round(score / 5);
  const nextXp = u.xp + xpAwarded;
  const lvl = levelForXp(nextXp);
  const leveledUp = lvl.level > u.level;
  await db
    .update(usersTable)
    .set({ xp: nextXp, level: lvl.level, lastActiveAt: new Date() })
    .where(eq(usersTable.id, u.id));
  if (xpAwarded > 0) {
    await db.insert(xpEventsTable).values({ userId: u.id, amount: xpAwarded, reason: "Quiz complete" });
  }

  res.json({
    score,
    correct,
    total,
    detail,
    xpAwarded,
    leveledUp,
    level: lvl.level,
    passed: score >= 60,
  });
});

export default router;
