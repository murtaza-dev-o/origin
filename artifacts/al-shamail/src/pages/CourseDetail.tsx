import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  Play, PlusCircle, CheckCircle2, Clock, ArrowLeft, Users,
  BookOpen, Trash2, Sparkles, FileText, Video, Image as ImageIcon,
  X, GripVertical, ChevronRight, AlignLeft,
} from "lucide-react";
import {
  useGetCourse, useGetCurrentUser, useCreateLesson, useDeleteLesson,
  useEnrollInCourse, useUpdateCourse, useDeleteCourse,
  getGetCourseQueryKey, getListMyEnrollmentsQueryKey,
} from "@workspace/api-client-react";
import { B } from "@/lib/brand";
import { DashboardLayout, Card, Pill, PrimaryButton, GoldButton, inputStyle } from "@/components/DashboardLayout";

type LessonKind = "video" | "reading";

const EMOJI_PRESETS = ["🌙","📖","☪️","✏️","📜","🎓","🕌","📚","🧠","⭐","📝","🔬","🎨","🌍","🕋"];
const COVER_COLORS = [
  "#1B2B5E","#C9A84C","#166534","#be185d","#4338ca","#0f766e","#b45309","#334155",
];

/* ── Reading lesson rendered as a pretty card ── */
function ReadingCard({ content }: { content: string }) {
  const lines = (content ?? "").replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let buf: string[] = [];
  let listBuf: string[] = [];

  const flushBuf = () => {
    if (!buf.length) return;
    nodes.push(<p key={`p${nodes.length}`} style={{ margin: "0 0 14px", color: B.text, lineHeight: 1.8 }}>{renderInline(buf.join(" "))}</p>);
    buf = [];
  };
  const flushList = () => {
    if (!listBuf.length) return;
    nodes.push(
      <ul key={`ul${nodes.length}`} style={{ margin: "0 0 14px 20px", padding: 0 }}>
        {listBuf.map((it, i) => <li key={i} style={{ marginBottom: 5, color: B.text, lineHeight: 1.7 }}>{renderInline(it)}</li>)}
      </ul>
    );
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushBuf(); flushList(); continue; }
    if (line.startsWith("# ")) {
      flushBuf(); flushList();
      nodes.push(<h2 key={`h${nodes.length}`} style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: B.navy, fontSize: 22, margin: "4px 0 14px" }}>{renderInline(line.slice(2))}</h2>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushBuf(); flushList();
      nodes.push(<h3 key={`h${nodes.length}`} style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: B.navy, fontSize: 17, margin: "14px 0 8px" }}>{renderInline(line.slice(3))}</h3>);
      continue;
    }
    if (line.startsWith("> ")) {
      flushBuf(); flushList();
      nodes.push(<blockquote key={`q${nodes.length}`} style={{ margin: "0 0 14px", padding: "12px 18px", borderLeft: `4px solid ${B.gold}`, background: B.offW, borderRadius: "0 10px 10px 0", color: B.navy, fontWeight: 600, fontStyle: "italic" }}>{renderInline(line.slice(2))}</blockquote>);
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
  let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={`b${i++}`} style={{ color: B.navy }}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ── Add lesson panel ── */
function AddLessonPanel({
  defaultKind, onSave, onCancel, isLoading,
}: {
  defaultKind: LessonKind; onSave: (data: any) => void; onCancel: () => void; isLoading: boolean;
}) {
  const [form, setForm] = useState({
    title: "", description: "", kind: defaultKind,
    videoUrl: "", content: "", durationMinutes: "10", xpReward: "20",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ background: `${B.gold}0A`, border: `1.5px dashed ${B.gold}88`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h4 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: B.navy, margin: 0, fontSize: 15 }}>
          Add {form.kind === "video" ? "Video Lesson" : "Reading Lesson"}
        </h4>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: B.muted }}><X size={16}/></button>
      </div>

      {/* Kind toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["video","reading"] as LessonKind[]).map((k) => (
          <button key={k} type="button" onClick={() => set("kind", k)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: "pointer",
            border: `1.5px solid ${form.kind === k ? B.gold : B.light}`,
            background: form.kind === k ? `${B.gold}18` : B.white,
            color: form.kind === k ? B.gold : B.muted, fontFamily: "inherit",
          }}>
            {k === "video" ? <Video size={13}/> : <AlignLeft size={13}/>}
            {k === "video" ? "Video" : "Reading"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <input placeholder="Lesson title *" value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle}/>
        <textarea placeholder="Short description" value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inputStyle, minHeight: 56, resize: "vertical" }}/>

        {form.kind === "video" ? (
          <input placeholder="Video URL (YouTube or .mp4)" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} style={inputStyle}/>
        ) : (
          <div>
            <div style={{ fontSize: 11, color: B.muted, marginBottom: 6 }}>
              Supports Markdown: <code># Heading</code>, <code>**bold**</code>, <code>{'> quote'}</code>, <code>- list</code>
            </div>
            <textarea
              placeholder={"# Introduction\n\nWrite your lesson content here. Use **bold** for emphasis.\n\n> Quotes look great for hadith or key points.\n\n- Bullet points\n- Like this"}
              value={form.content} onChange={(e) => set("content", e.target.value)}
              style={{ ...inputStyle, minHeight: 220, resize: "vertical", fontFamily: "ui-monospace,monospace", fontSize: 12, lineHeight: 1.6 }}
            />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input placeholder="Duration (minutes)" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} style={inputStyle} type="number" min={0}/>
          <input placeholder="XP reward" value={form.xpReward} onChange={(e) => set("xpReward", e.target.value)} style={inputStyle} type="number" min={0}/>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <GoldButton onClick={() => {
          if (!form.title) return;
          if (form.kind === "video" && !form.videoUrl) return;
          if (form.kind === "reading" && !form.content.trim()) return;
          onSave(form);
        }} disabled={isLoading}>
          {form.kind === "video" ? <><Video size={13}/> Add Video</> : <><AlignLeft size={13}/> Add Reading</>}
        </GoldButton>
        <button onClick={onCancel} style={{ background: "none", border: `1.5px solid ${B.light}`, borderRadius: 10, padding: "9px 18px", color: B.muted, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Thumbnail/Banner editor for staff ── */
function ThumbnailEditor({ course, onSave }: { course: any; onSave: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(course.bannerUrl ?? "");
  const [emoji, setEmoji] = useState(course.coverEmoji ?? "📘");
  const [color, setColor] = useState(course.coverColor ?? B.navy);
  const importImage = (field: "thumbnail" | "banner", file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const next = String(reader.result ?? "");
      if (field === "thumbnail") setThumbnailUrl(next);
      else setBannerUrl(next);
    };
    reader.readAsDataURL(file);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer",
        border: `1.5px solid ${B.light}`, background: B.white, color: B.muted, fontFamily: "inherit",
      }}>
        <ImageIcon size={13}/> Edit Thumbnail / Banner
      </button>
    );
  }

  return (
    <div style={{ background: B.white, border: `1.5px solid ${B.light}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: B.navy, fontSize: 13 }}>Edit Course Media</div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: B.muted }}><X size={15}/></button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".07em" }}>Thumbnail URL (cards)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://…" style={inputStyle}/>
            <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 12px", borderRadius: 10, border: `1.5px solid ${B.light}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: B.navy, background: B.offW }}>
              Import
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => importImage("thumbnail", e.target.files?.[0])} />
            </label>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".07em" }}>Banner URL (course page header)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://…" style={inputStyle}/>
            <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 12px", borderRadius: 10, border: `1.5px solid ${B.light}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: B.navy, background: B.offW }}>
              Import
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => importImage("banner", e.target.files?.[0])} />
            </label>
          </div>
        </div>
        {!thumbnailUrl && (
          <>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".07em" }}>Emoji</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {EMOJI_PRESETS.map((em) => (
                  <button key={em} type="button" onClick={() => setEmoji(em)} style={{ width: 32, height: 32, borderRadius: 7, border: `1.5px solid ${emoji === em ? B.gold : B.light}`, background: emoji === em ? `${B.gold}14` : B.offW, fontSize: 17, cursor: "pointer" }}>{em}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".07em" }}>Colour</label>
              <div style={{ display: "flex", gap: 6 }}>
                {COVER_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: 6, border: `2.5px solid ${color === c ? B.gold : "transparent"}`, background: c, cursor: "pointer" }}/>
                ))}
              </div>
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <PrimaryButton onClick={() => { onSave({ thumbnailUrl, bannerUrl, coverEmoji: emoji, coverColor: color }); setOpen(false); }}>Save</PrimaryButton>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: `1.5px solid ${B.light}`, borderRadius: 10, padding: "9px 14px", color: B.muted, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ══ */
export default function CourseDetail() {
  const [, params] = useRoute<{ id: string }>("/courses/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const qc = useQueryClient();
  const me = useGetCurrentUser();
  const user = me.data?.user;
  const isStaff = !!user?.isAdmin || user?.role === "teacher";
  const isStudent = !!user && !isStaff;

  const courseQ = useGetCourse(id, { query: { enabled: id > 0 } });
  const data: any = courseQ.data;
  const course = data?.course;
  const lessons: any[] = data?.lessons ?? [];
  const isEnrolled = !!data?.enrolled;
  const completedSet = new Set<number>((data?.completedLessonIds ?? []) as number[]);
  const progress = data?.progress ?? 0;

  const enroll = useEnrollInCourse();
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const [, setLocation] = useLocation();

  const onDeleteCourse = async () => {
    if (!course) return;
    if (!window.confirm(`Permanently delete "${course.title}"? This will remove all lessons, enrollments, and progress for this course. This cannot be undone.`)) {
      return;
    }
    try {
      await deleteCourse.mutateAsync({ id });
      setLocation("/courses");
    } catch (err: any) {
      window.alert(err?.message ?? "Couldn't delete course.");
    }
  };

  const [tab, setTab] = useState<LessonKind>("video");
  const [showAdd, setShowAdd] = useState(false);

  const videos = lessons.filter((l) => (l.kind ?? "video") === "video");
  const readings = lessons.filter((l) => l.kind === "reading");
  const visible = tab === "video" ? videos : readings;

  const onEnroll = async () => {
    await enroll.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getGetCourseQueryKey(id) });
    await qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
  };

  const onAddLesson = async (form: any) => {
    await createLesson.mutateAsync({
      courseId: id,
      data: {
        title: form.title, description: form.description, kind: form.kind,
        videoUrl: form.kind === "video" ? form.videoUrl : "",
        content: form.kind === "reading" ? form.content : "",
        durationMinutes: parseInt(form.durationMinutes, 10) || 10,
        xpReward: parseInt(form.xpReward, 10) || 20,
      } as any,
    });
    await qc.invalidateQueries({ queryKey: getGetCourseQueryKey(id) });
    setShowAdd(false);
  };

  const onDelete = async (lessonId: number) => {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson.mutateAsync({ id: lessonId });
    await qc.invalidateQueries({ queryKey: getGetCourseQueryKey(id) });
  };

  const onUpdateThumbnail = async (patch: any) => {
    try {
      const payload = {
        thumbnailUrl: patch.thumbnailUrl ?? null,
        bannerUrl: patch.bannerUrl ?? null,
        coverEmoji: patch.coverEmoji ?? course.coverEmoji,
        coverColor: patch.coverColor ?? course.coverColor,
      };
      await updateCourse.mutateAsync({ id, data: payload as any });
      await qc.invalidateQueries({ queryKey: getGetCourseQueryKey(id) });
      await qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (err: any) {
      window.alert(err?.message ?? "Couldn't update course media. Try a smaller image or a direct URL.");
    }
  };

  return (
    <DashboardLayout
      title={course?.title ?? "Course"}
      subtitle={course ? `${course.subject} · ${course.level}` : ""}
      action={isStaff && course ? (
        <button
          onClick={onDeleteCourse}
          disabled={deleteCourse.isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: B.white, color: B.error,
            border: `1.5px solid ${B.error}33`,
            cursor: deleteCourse.isPending ? "wait" : "pointer",
            opacity: deleteCourse.isPending ? 0.6 : 1,
          }}
          title="Delete this course"
        >
          <Trash2 size={14}/>
          {deleteCourse.isPending ? "Deleting…" : "Delete Course"}
        </button>
      ) : undefined}
    >
      <div style={{ marginBottom: 18 }}>
        <Link href="/courses" style={{ color: B.muted, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={13}/> All Courses
        </Link>
      </div>

      {!course ? (
        <div style={{ color: B.muted }}>Loading…</div>
      ) : (
        <>
          {/* ── Course hero ── */}
          <div style={{
            borderRadius: 22, overflow: "hidden", marginBottom: 22,
            border: `1px solid ${B.light}`,
            boxShadow: "0 4px 24px rgba(27,43,94,.09)",
          }}>
            <div style={{ position: "relative", minHeight: 220 }}>
              {course.bannerUrl ? (
                <img src={course.bannerUrl} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}/>
              ) : course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}/>
              ) : (
                <div style={{
                  width: "100%", height: 220,
                  background: `linear-gradient(135deg, ${course.coverColor ?? B.navy} 0%, ${course.coverColor ?? B.navy}dd 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 90, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, opacity: .06, backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: "24px 24px" }}/>
                  <span style={{ position: "relative", zIndex: 1 }}>{course.coverEmoji}</span>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.05) 15%, rgba(0,0,0,.55) 100%)" }}/>

                {/* Overlay content */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 28px", color: B.white }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <Pill color={B.goldL}>{course.subject}</Pill>
                    <Pill color={B.goldL}>{course.level}</Pill>
                    {course.published ? <Pill color={"#4ade80"}>Published</Pill> : <Pill color={"#f87171"}>Draft</Pill>}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 26, margin: 0, textShadow: "0 2px 10px rgba(0,0,0,.3)" }}>{course.title}</h2>
                </div>

                {/* Enroll button */}
                {isStudent && !isEnrolled && (
                  <button onClick={onEnroll} disabled={enroll.isPending} style={{
                    position: "absolute", top: 18, right: 18,
                    background: `linear-gradient(135deg, ${B.gold}, ${B.goldD})`,
                    color: B.white, border: "none", padding: "11px 22px", borderRadius: 12,
                    fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(201,168,76,.4)",
                  }}>
                    Enroll Free
                  </button>
                )}
                {isStudent && isEnrolled && (
                  <div style={{
                    position: "absolute", top: 18, right: 18,
                    background: "rgba(255,255,255,.18)", backdropFilter: "blur(8px)",
                    color: B.white, padding: "10px 18px", borderRadius: 12,
                    fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                    border: "1px solid rgba(255,255,255,.3)",
                  }}>
                    <CheckCircle2 size={15}/> Enrolled
                  </div>
                )}
            </div>

            {/* Info bar */}
            <div style={{ background: B.white, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: B.muted, fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Video size={14}/> {videos.length} videos</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FileText size={14}/> {readings.length} readings</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={14}/> {course.enrolledCount ?? 0} enrolled</span>
                {course.teacherName && <span>Taught by {course.teacherName}</span>}
              </div>

              {isEnrolled && lessons.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ background: B.light, borderRadius: 999, height: 6, width: 160, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${B.gold}, ${B.goldL})` }}/>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: B.navy }}>{progress}%</div>
                </div>
              )}

              {/* Description */}
              {course.description && (
                <p style={{ margin: 0, fontSize: 13.5, color: B.muted, lineHeight: 1.65, width: "100%", borderTop: `1px solid ${B.light}`, paddingTop: 14, marginTop: 4 }}>
                  {course.description}
                </p>
              )}

              {/* Staff: thumbnail editor */}
              {isStaff && <ThumbnailEditor course={course} onSave={onUpdateThumbnail}/>}
            </div>
          </div>

          {/* ── Lessons ── */}
          {/* Tab row */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: `1.5px solid ${B.light}` }}>
            {([["video", "Videos", videos.length], ["reading", "Reading", readings.length]] as const).map(([k, label, count]) => (
              <button key={k} onClick={() => { setTab(k as LessonKind); setShowAdd(false); }} style={{
                background: "transparent", border: "none",
                borderBottom: `3px solid ${tab === k ? B.gold : "transparent"}`,
                color: tab === k ? B.navy : B.muted, fontWeight: 700, fontSize: 14,
                padding: "10px 18px", cursor: "pointer", marginBottom: -1.5, fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 7,
                transition: "color .15s",
              }}>
                {k === "video" ? <Video size={14}/> : <AlignLeft size={14}/>}
                {label}
                <span style={{ fontSize: 11, background: tab === k ? `${B.gold}20` : B.light, color: tab === k ? B.gold : B.muted, padding: "1px 7px", borderRadius: 99, fontWeight: 800 }}>{count}</span>
              </button>
            ))}
          </div>

          <Card
            title={tab === "video" ? "Video Lessons" : "Reading Lessons"}
            action={isStaff && (
              <GoldButton onClick={() => setShowAdd((v) => !v)} style={{ padding: "7px 14px", fontSize: 12 }}>
                <PlusCircle size={13}/> Add {tab === "video" ? "Video" : "Reading"}
              </GoldButton>
            )}
          >
            {showAdd && isStaff && (
              <AddLessonPanel
                defaultKind={tab}
                onSave={onAddLesson}
                onCancel={() => setShowAdd(false)}
                isLoading={createLesson.isPending}
              />
            )}

            {visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: B.offW, borderRadius: 14, border: `1.5px dashed ${B.light}` }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: .4 }}>{tab === "video" ? "🎬" : "📖"}</div>
                <div style={{ fontWeight: 700, color: B.navy, marginBottom: 4, fontSize: 15 }}>No {tab === "video" ? "videos" : "reading material"} yet</div>
                <div style={{ fontSize: 13, color: B.muted }}>
                  {isStaff ? `Click "Add ${tab === "video" ? "Video" : "Reading"}" to add content.` : "Your teacher hasn't added this yet."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visible.map((l: any, i: number) => {
                  const done = completedSet.has(l.id) || l.completed;
                  const kind: LessonKind = l.kind === "reading" ? "reading" : "video";
                  return (
                    <div
                      key={l.id}
                      className="lesson-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 1fr auto auto",
                        alignItems: "center", gap: 14, padding: "14px 16px",
                        borderRadius: 14, border: `1.5px solid ${done ? B.success + "44" : B.light}`,
                        background: done ? `${B.success}08` : B.offW,
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: done ? B.success : `linear-gradient(135deg, ${B.navy}, ${B.navyL})`,
                        color: B.white, display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 13, flexShrink: 0,
                      }}>
                        {done ? <CheckCircle2 size={17}/> : i + 1}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: B.navy, fontSize: 14, marginBottom: 3 }}>{l.title}</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          {l.durationMinutes > 0 && (
                            <span style={{ fontSize: 11.5, color: B.muted, display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={11}/> {l.durationMinutes} min{kind === "reading" ? " read" : ""}
                            </span>
                          )}
                          <span style={{ fontSize: 11.5, color: B.gold, display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                            <Sparkles size={11}/> {l.xpReward} XP
                          </span>
                          {l.hasQuiz && <Pill color={B.gold}>Quiz</Pill>}
                          {done && <Pill color={B.success}>Completed</Pill>}
                        </div>
                      </div>

                      <Link href={`/lessons/${l.id}`} style={{
                        background: `linear-gradient(135deg, ${B.navy}, ${B.navyL})`,
                        color: B.white, textDecoration: "none",
                        padding: "8px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}>
                        {kind === "video" ? <><Play size={12}/> Watch</> : <><BookOpen size={12}/> Read</>}
                        <ChevronRight size={12}/>
                      </Link>

                      {isStaff && (
                        <button onClick={() => onDelete(l.id)} style={{
                          background: "transparent", border: `1px solid ${B.light}`, color: B.error,
                          padding: 8, borderRadius: 9, cursor: "pointer", display: "flex",
                        }} title="Delete lesson">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
