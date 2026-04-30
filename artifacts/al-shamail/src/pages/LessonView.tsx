import { useState, useRef, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, CheckCircle2, Sparkles, Trophy, ClipboardList,
  BookOpen, Play, Clock, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  useGetLesson, useCompleteLesson, useGetLessonQuiz, useGetCurrentUser,
  getGetLessonQueryKey, getGetCourseQueryKey, getGetCurrentUserQueryKey,
  getListMyEnrollmentsQueryKey,
} from "@workspace/api-client-react";
import { B } from "@/lib/brand";
import { DashboardLayout, Card, Pill, GoldButton } from "@/components/DashboardLayout";

/* ── Reading renderer ── */
function ReadingContent({ content }: { content: string }) {
  const lines = (content ?? "").replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let buf: string[] = [], listBuf: string[] = [];

  const flushBuf = () => {
    if (!buf.length) return;
    nodes.push(<p key={`p${nodes.length}`} style={{ margin: "0 0 18px", lineHeight: 1.85, color: "#374151" }}>{renderInline(buf.join(" "))}</p>);
    buf = [];
  };
  const flushList = () => {
    if (!listBuf.length) return;
    nodes.push(
      <ul key={`ul${nodes.length}`} style={{ margin: "0 0 18px 0", padding: "0 0 0 24px", listStyle: "disc" }}>
        {listBuf.map((it, i) => (
          <li key={i} style={{ marginBottom: 7, lineHeight: 1.75, color: "#374151" }}>
            {renderInline(it)}
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushBuf(); flushList(); continue; }
    if (line.startsWith("# ")) {
      flushBuf(); flushList();
      nodes.push(
        <h2 key={`h${nodes.length}`} style={{
          fontFamily: "'Playfair Display',serif", fontWeight: 900, color: B.navy,
          fontSize: 26, margin: "28px 0 16px", lineHeight: 1.2,
          borderBottom: `2px solid ${B.gold}44`, paddingBottom: 10,
        }}>
          {renderInline(line.slice(2))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushBuf(); flushList();
      nodes.push(<h3 key={`h${nodes.length}`} style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: B.navy, fontSize: 19, margin: "22px 0 10px" }}>{renderInline(line.slice(3))}</h3>);
      continue;
    }
    if (line.startsWith("### ")) {
      flushBuf(); flushList();
      nodes.push(<h4 key={`h${nodes.length}`} style={{ fontWeight: 800, color: B.navy, fontSize: 15, margin: "16px 0 6px" }}>{renderInline(line.slice(4))}</h4>);
      continue;
    }
    if (line.startsWith("> ")) {
      flushBuf(); flushList();
      nodes.push(
        <blockquote key={`q${nodes.length}`} style={{
          margin: "0 0 18px", padding: "16px 22px",
          borderLeft: `5px solid ${B.gold}`, background: `${B.gold}0E`,
          borderRadius: "0 14px 14px 0", color: B.navy,
          fontWeight: 600, fontStyle: "italic", fontSize: 15.5, lineHeight: 1.7,
        }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) { flushBuf(); listBuf.push(line.replace(/^[-*]\s+/, "")); continue; }
    flushList(); buf.push(line);
  }
  flushBuf(); flushList();
  return <>{nodes}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0; let m; let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={`b${i++}`} style={{ color: B.navy, fontWeight: 800 }}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v"); if (v) return v;
      const parts = u.pathname.split("/"); const i = parts.indexOf("embed");
      if (i >= 0) return parts[i + 1] ?? null;
    }
  } catch { return null; }
  return null;
}

/* ══ MAIN ══ */
export default function LessonView() {
  const [, params] = useRoute<{ id: string }>("/lessons/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const me = useGetCurrentUser();

  const lessonQ = useGetLesson(id, { query: { enabled: id > 0 } });
  const quizQ = useGetLessonQuiz(id, { query: { enabled: id > 0, retry: false } });
  const complete = useCompleteLesson();

  const lesson: any = lessonQ.data;
  const quiz: any = (quizQ as any).data;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [watched, setWatched] = useState(0);
  const [reward, setReward] = useState<{ xpAwarded: number; leveledUp: boolean; level: number; newBadges: any[] } | null>(null);

  useEffect(() => { setReward(null); setWatched(0); }, [id]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setWatched(Math.min(100, Math.round((v.currentTime / v.duration) * 100)));
  };

  const onComplete = async () => {
    const r = await complete.mutateAsync({ id });
    setReward({ xpAwarded: (r as any).xpAwarded, leveledUp: (r as any).leveledUp, level: (r as any).level, newBadges: (r as any).newBadges ?? [] });
    await qc.invalidateQueries({ queryKey: getGetLessonQueryKey(id) });
    if (lesson?.courseId) await qc.invalidateQueries({ queryKey: getGetCourseQueryKey(lesson.courseId) });
    await qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    await qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
  };

  const isReading = lesson?.kind === "reading";
  const isYouTube = !isReading && lesson?.videoUrl && (lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be"));
  const youTubeId = isYouTube ? extractYouTubeId(lesson.videoUrl) : null;

  return (
    <DashboardLayout title={lesson?.title ?? "Lesson"} subtitle="">
      <div style={{ marginBottom: 18 }}>
        {lesson?.courseId && (
          <Link href={`/courses/${lesson.courseId}`} style={{ color: B.muted, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={13}/> Back to Course
          </Link>
        )}
      </div>

      {!lesson ? (
        <div style={{ color: B.muted }}>Loading…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

          {/* ── LEFT: Content ── */}
          <div style={{ minWidth: 0 }}>
            {isReading ? (
              /* Reading lesson — beautiful article layout */
              <div style={{
                background: B.white, borderRadius: 20, border: `1px solid ${B.light}`,
                boxShadow: "0 4px 24px rgba(27,43,94,.07)", overflow: "hidden",
              }}>
                {/* Reading header */}
                <div style={{
                  padding: "28px 36px 22px",
                  background: `linear-gradient(135deg, ${B.navyD} 0%, ${B.navy} 100%)`,
                  color: B.white, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, opacity: .05, backgroundImage: `radial-gradient(circle, ${B.gold} 1px, transparent 1px)`, backgroundSize: "20px 20px" }}/>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${B.gold}28`, border: `1px solid ${B.gold}55`, padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, color: B.goldL, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>
                    <BookOpen size={12}/> Reading Lesson
                  </div>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 24, margin: 0, lineHeight: 1.2 }}>{lesson.title}</h1>
                  <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12.5, color: "rgba(255,255,255,.65)", fontWeight: 600 }}>
                    {lesson.durationMinutes > 0 && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={12}/> {lesson.durationMinutes} min read</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={12} color={B.goldL}/> {lesson.xpReward} XP on completion</span>
                  </div>
                </div>

                {/* Article body */}
                <div style={{ padding: "36px 40px", fontSize: 16, lineHeight: 1.85, fontFamily: "'DM Sans', Georgia, serif", maxWidth: 780 }}>
                  {lesson.content?.trim() ? (
                    <ReadingContent content={lesson.content}/>
                  ) : (
                    <p style={{ color: B.muted, fontStyle: "italic" }}>No reading content has been added to this lesson yet.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Video lesson */
              <>
                <div style={{
                  background: "#000", borderRadius: 18, overflow: "hidden",
                  aspectRatio: "16 / 9", boxShadow: "0 8px 40px rgba(0,0,0,.25)",
                  marginBottom: 16,
                }}>
                  {isYouTube && youTubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youTubeId}`}
                      title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen style={{ width: "100%", height: "100%", border: 0 }}
                    />
                  ) : (
                    <video ref={videoRef} src={lesson.videoUrl} controls onTimeUpdate={onTimeUpdate} style={{ width: "100%", height: "100%", display: "block" }}/>
                  )}
                </div>

                {/* Progress bar for native video */}
                {!isYouTube && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: B.muted, fontWeight: 700, marginBottom: 5 }}>
                      <span>Watched</span><span>{watched}%</span>
                    </div>
                    <div style={{ background: B.light, borderRadius: 999, height: 5, overflow: "hidden" }}>
                      <div style={{ width: `${watched}%`, height: "100%", background: `linear-gradient(90deg, ${B.gold}, ${B.goldL})`, transition: "width .5s" }}/>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Lesson meta card */}
            <Card style={{ marginTop: 16 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: B.navy, margin: "0 0 10px", fontSize: 20 }}>{lesson.title}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {lesson.durationMinutes > 0 && <Pill color={B.navy}><Clock size={11}/> {lesson.durationMinutes} min</Pill>}
                <Pill color={B.gold}><Sparkles size={11}/> {lesson.xpReward} XP</Pill>
                {lesson.hasQuiz && <Pill color={B.navyL}>Quiz available</Pill>}
                {lesson.completed && <Pill color={B.success}><CheckCircle2 size={11}/> Completed</Pill>}
              </div>
              {lesson.description && <p style={{ margin: 0, color: B.muted, lineHeight: 1.65, fontSize: 14 }}>{lesson.description}</p>}
            </Card>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Complete card */}
            <Card title="Mark Complete">
              {lesson.completed && !reward ? (
                <div style={{ color: B.success, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                  <CheckCircle2 size={18}/> You've completed this lesson!
                </div>
              ) : (
                <GoldButton onClick={onComplete} disabled={complete.isPending || lesson.completed} full>
                  <CheckCircle2 size={15}/>
                  {lesson.completed ? "Already complete" : `Complete (+${lesson.xpReward} XP)`}
                </GoldButton>
              )}

              {reward && (
                <div style={{
                  marginTop: 16,
                  background: `linear-gradient(135deg, ${B.gold}18, ${B.goldL}28)`,
                  border: `1.5px solid ${B.gold}55`, borderRadius: 14, padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: B.navy, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                    <Sparkles size={18} color={B.gold}/> +{reward.xpAwarded} XP earned!
                  </div>
                  {reward.leveledUp && (
                    <div style={{ color: B.gold, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 6 }}>
                      <Trophy size={15}/> Level up! Now Level {reward.level}
                    </div>
                  )}
                  {reward.newBadges.map((b: any) => (
                    <div key={b.id} style={{ color: B.navy, fontWeight: 700, fontSize: 13, marginTop: 4 }}>🏅 {b.name}</div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quiz card */}
            {lesson.hasQuiz && quiz && (
              <Card title="Lesson Quiz">
                <div style={{ fontSize: 14, color: B.text, marginBottom: 6, fontWeight: 600 }}>{quiz.title}</div>
                <div style={{ fontSize: 12, color: B.muted, marginBottom: 14 }}>
                  {quiz.questions?.length ?? 0} questions · up to {quiz.xpReward} XP
                </div>
                <Link href={`/lessons/${id}/quiz`} style={{
                  background: `linear-gradient(135deg, ${B.navy}, ${B.navyL})`,
                  color: B.white, textDecoration: "none",
                  padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <ClipboardList size={14}/> Take Quiz
                </Link>
              </Card>
            )}

            {/* Back to course */}
            {lesson.courseId && (
              <Link href={`/courses/${lesson.courseId}`} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", borderRadius: 14,
                background: B.white, border: `1px solid ${B.light}`,
                color: B.navy, textDecoration: "none", fontSize: 13, fontWeight: 700,
                boxShadow: "0 2px 8px rgba(27,43,94,.05)",
              }}>
                <ChevronLeft size={14}/> Back to Course
              </Link>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
