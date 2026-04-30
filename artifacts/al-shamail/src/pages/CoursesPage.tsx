import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Search, Plus, BookOpen, Upload, Sparkles, Users, CheckCircle2,
  Image as ImageIcon, X, ChevronDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListCourses, useCreateCourse, useEnrollInCourse, useImportCourses,
  useGetCurrentUser, useListMyEnrollments,
  getListCoursesQueryKey, getListMyEnrollmentsQueryKey,
} from "@workspace/api-client-react";
import { B } from "@/lib/brand";
import { DashboardLayout, Card, Pill, PrimaryButton, GoldButton, inputStyle } from "@/components/DashboardLayout";

/* ── Curated emoji thumbnails ── */
const EMOJI_PRESETS = [
  "🌙","📖","☪️","✏️","📜","🎓","🕌","📚","🧠","⭐","🌟","📝","🔬","🎨","🎭","🌍","🕋","🤲","📿","💎",
];

/* ── Colour palette for covers ── */
const COVER_COLORS = [
  { label: "Navy",   value: "#1B2B5E" },
  { label: "Gold",   value: "#C9A84C" },
  { label: "Forest", value: "#166534" },
  { label: "Rose",   value: "#be185d" },
  { label: "Indigo", value: "#4338ca" },
  { label: "Teal",   value: "#0f766e" },
  { label: "Amber",  value: "#b45309" },
  { label: "Slate",  value: "#334155" },
];

/* ── Thumbnail component — supports image URL or emoji+color ── */
function CourseThumbnail({
  thumbnailUrl, coverEmoji, coverColor, size = 180,
}: {
  thumbnailUrl?: string; coverEmoji?: string; coverColor?: string;
  size?: number;
}) {
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt=""
        style={{ width: "100%", height: size, objectFit: "cover", display: "block" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div style={{
      width: "100%", height: size,
      background: `linear-gradient(135deg, ${coverColor ?? B.navy} 0%, ${coverColor ?? B.navy}cc 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, position: "relative", overflow: "hidden",
    }}>
      {/* Decorative pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: .07,
        backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}/>
      <span style={{ position: "relative", zIndex: 1 }}>{coverEmoji ?? "📘"}</span>
    </div>
  );
}

/* ── New course modal/panel ── */
function NewCoursePanel({
  onSave, onCancel, isLoading,
}: {
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    title: "", subject: "", level: "All Ages", description: "",
    coverEmoji: "📘", coverColor: B.navy, thumbnailUrl: "", bannerUrl: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const importImageToField = (field: "thumbnailUrl" | "bannerUrl", file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set(field, String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      background: B.white, border: `1.5px solid ${B.gold}55`,
      borderRadius: 18, padding: 24, marginBottom: 20,
      boxShadow: "0 8px 32px rgba(201,168,76,.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: B.gold, textTransform: "uppercase", letterSpacing: ".12em" }}>New Course</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 18, color: B.navy, margin: "4px 0 0" }}>Create a Course</h3>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: B.muted }}>
          <X size={18}/>
        </button>
      </div>

      {/* Live preview */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Thumbnail Preview</div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${B.light}`, boxShadow: "0 4px 14px rgba(27,43,94,.1)" }}>
            <CourseThumbnail
              thumbnailUrl={form.thumbnailUrl}
              coverEmoji={form.coverEmoji}
              coverColor={form.coverColor}
              size={140}
            />
            <div style={{ padding: "12px 14px", background: B.white }}>
              <div style={{ fontWeight: 800, color: B.navy, fontSize: 13, marginBottom: 3, fontFamily: "'Playfair Display', serif" }}>
                {form.title || "Course Title"}
              </div>
              <div style={{ fontSize: 11, color: B.muted }}>{form.subject || "Subject"} · {form.level}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Course Title *</label>
              <input placeholder="e.g. Tajweed Fundamentals" value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} required/>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Subject *</label>
              <input placeholder="e.g. Islamic Studies" value={form.subject} onChange={(e) => set("subject", e.target.value)} style={inputStyle} required/>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Level</label>
            <select value={form.level} onChange={(e) => set("level", e.target.value)} style={{ ...inputStyle, appearance: "none" as any }}>
              {["All Ages","Beginner","Grade 1–3","Grade 4–6","Grade 7–9","Grade 10–12","Intermediate","Advanced"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Description *</label>
            <textarea
              placeholder="What will students learn in this course?"
              value={form.description} onChange={(e) => set("description", e.target.value)}
              style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
              required
            />
          </div>

          {/* Thumbnail image URL */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>
              <ImageIcon size={12} style={{ marginRight: 4, verticalAlign: "middle" }}/>
              Thumbnail Image URL <span style={{ color: B.muted, fontWeight: 400 }}>(optional — leave blank to use emoji)</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                placeholder="https://images.unsplash.com/…"
                value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)}
                style={inputStyle}
              />
              <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 12px", borderRadius: 10, border: `1.5px solid ${B.light}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: B.navy, background: B.offW }}>
                Import
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => importImageToField("thumbnailUrl", e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>
              Banner Image URL <span style={{ color: B.muted, fontWeight: 400 }}>(optional — used on course page hero)</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                placeholder="https://images.unsplash.com/…"
                value={form.bannerUrl} onChange={(e) => set("bannerUrl", e.target.value)}
                style={inputStyle}
              />
              <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 12px", borderRadius: 10, border: `1.5px solid ${B.light}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: B.navy, background: B.offW }}>
                Import
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => importImageToField("bannerUrl", e.target.files?.[0])} />
              </label>
            </div>
          </div>

          {/* Emoji + colour — only shown if no thumbnail URL */}
          {!form.thumbnailUrl && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Cover Emoji</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {EMOJI_PRESETS.slice(0, 10).map((em) => (
                    <button
                      key={em} type="button"
                      onClick={() => set("coverEmoji", em)}
                      style={{
                        width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${form.coverEmoji === em ? B.gold : B.light}`,
                        background: form.coverEmoji === em ? `${B.gold}18` : B.offW,
                        fontSize: 18, cursor: "pointer",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: B.navy, display: "block", marginBottom: 6 }}>Cover Colour</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c.value} type="button"
                      onClick={() => set("coverColor", c.value)}
                      style={{
                        width: 28, height: 28, borderRadius: 7, border: `2.5px solid ${form.coverColor === c.value ? B.gold : "transparent"}`,
                        background: c.value, cursor: "pointer",
                        boxShadow: form.coverColor === c.value ? `0 0 0 2px ${B.gold}55` : "none",
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ background: "none", border: `1.5px solid ${B.light}`, borderRadius: 10, padding: "9px 18px", color: B.muted, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          Cancel
        </button>
        <GoldButton
          onClick={() => {
            if (!form.title || !form.subject || !form.description) return;
            onSave(form);
          }}
          disabled={isLoading}
        >
          <Plus size={14}/> Create Course
        </GoldButton>
      </div>
    </div>
  );
}

/* ── Import panel ── */
function ImportPanel({ onImport, onCancel, isLoading }: { onImport: (json: string) => void; onCancel: () => void; isLoading: boolean }) {
  const [json, setJson] = useState("");
  return (
    <div style={{
      background: B.white, border: `1.5px dashed ${B.navy}55`, borderRadius: 18,
      padding: 20, marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 16, color: B.navy, margin: 0 }}>Import Courses via JSON</h3>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: B.muted }}><X size={16}/></button>
      </div>
      <div style={{ fontSize: 12, color: B.muted, marginBottom: 10, lineHeight: 1.6 }}>
        Paste a JSON array. Each course can include a <code style={{ background: B.offW, padding: "1px 5px", borderRadius: 4 }}>thumbnailUrl</code> field for a custom image thumbnail.
        <br/>
        Schema: <code style={{ background: B.offW, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{`[{title, subject, level, description, coverEmoji?, coverColor?, thumbnailUrl?, lessons:[{title,videoUrl|content,kind}]}]`}</code>
      </div>
      <textarea
        value={json} onChange={(e) => setJson(e.target.value)}
        placeholder='[{"title":"Tajweed Basics","subject":"Quran","level":"Beginner","description":"…","thumbnailUrl":"https://…","lessons":[{"title":"Lesson 1","videoUrl":"https://…","kind":"video"}]}]'
        style={{ ...inputStyle, minHeight: 160, fontFamily: "ui-monospace,monospace", fontSize: 12, resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <PrimaryButton onClick={() => onImport(json)} disabled={isLoading}>Import Courses</PrimaryButton>
        <button onClick={onCancel} style={{ background: "none", border: `1.5px solid ${B.light}`, borderRadius: 10, padding: "9px 18px", color: B.muted, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ══ */
export default function CoursesPage() {
  const qc = useQueryClient();
  const me = useGetCurrentUser();
  const user = me.data?.user;
  const isStaff = !!user?.isAdmin || user?.role === "teacher";
  const isStudent = !!user && !isStaff;

  const list = useListCourses();
  const items: any[] = list.data?.items ?? [];
  const enrollments = useListMyEnrollments({ query: { enabled: !!user } });
  const enrolledIds = new Set<number>((enrollments.data?.items ?? []).map((e: any) => e.courseId));

  const enroll = useEnrollInCourse();
  const create = useCreateCourse();
  const importMut = useImportCourses();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const allLevels = ["All", ...Array.from(new Set(items.map((c: any) => c.level).filter(Boolean)))];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((c: any) => {
      if (levelFilter !== "All" && c.level !== levelFilter) return false;
      if (!term) return true;
      return [c.title, c.subject, c.description, c.level].join(" ").toLowerCase().includes(term);
    });
  }, [items, search, levelFilter]);

  const onEnroll = async (id: number) => {
    await enroll.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
    await qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
  };

  const onCreate = async (form: any) => {
    await create.mutateAsync({
      data: {
        title: form.title, subject: form.subject, level: form.level,
        description: form.description, coverEmoji: form.coverEmoji,
        coverColor: form.coverColor, published: true,
        ...(form.thumbnailUrl ? { thumbnailUrl: form.thumbnailUrl } : {}),
        ...(form.bannerUrl ? { bannerUrl: form.bannerUrl } : {}),
      },
    });
    await qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    setShowNew(false);
  };

  const onImport = async (json: string) => {
    try {
      const parsed = JSON.parse(json);
      const courses = Array.isArray(parsed) ? parsed : parsed.courses;
      if (!Array.isArray(courses)) { window.alert("Expected an array of courses."); return; }
      const result = await importMut.mutateAsync({ data: { courses } });
      await qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      window.alert(`Imported ${(result as any).created} courses.`);
      setShowImport(false);
    } catch (err) { window.alert("Invalid JSON: " + (err as Error).message); }
  };

  return (
    <DashboardLayout
      title="Courses"
      subtitle={isStudent ? "Enroll in courses and start learning today." : "Manage your course catalogue."}
    >
      {/* Staff panels */}
      {showNew && isStaff && <NewCoursePanel onSave={onCreate} onCancel={() => setShowNew(false)} isLoading={create.isPending}/>}
      {showImport && isStaff && <ImportPanel onImport={onImport} onCancel={() => setShowImport(false)} isLoading={importMut.isPending}/>}

      <Card>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <Search size={15} color={B.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}/>
            <input
              placeholder="Search courses…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          {/* Level filter chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {allLevels.slice(0, 6).map((level) => (
              <button key={level} onClick={() => setLevelFilter(level)} style={{
                padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${levelFilter === level ? B.gold : B.light}`,
                background: levelFilter === level ? `${B.gold}18` : B.white,
                color: levelFilter === level ? B.gold : B.muted, fontFamily: "inherit",
              }}>
                {level}
              </button>
            ))}
          </div>

          {isStaff && (
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => { setShowImport((v) => !v); setShowNew(false); }} style={{
                background: "transparent", border: `1.5px solid ${B.navy}`, color: B.navy,
                borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              }}>
                <Upload size={14}/> Import JSON
              </button>
              <GoldButton onClick={() => { setShowNew((v) => !v); setShowImport(false); }}>
                <Plus size={14}/> New Course
              </GoldButton>
            </div>
          )}
        </div>

        {/* Course grid */}
        {list.isLoading ? (
          <div style={{ color: B.muted, padding: "40px 0", textAlign: "center" }}>Loading courses…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: B.muted, textAlign: "center", padding: "48px 0" }}>
            <BookOpen size={40} color={B.light} style={{ margin: "0 auto 12px" }}/>
            <div style={{ fontWeight: 700, color: B.navy, fontFamily: "'Playfair Display', serif", fontSize: 16, marginBottom: 4 }}>No courses found</div>
            <div style={{ fontSize: 13 }}>Try a different search or filter.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
            {filtered.map((c: any) => {
              const enrolled = enrolledIds.has(c.id);
              return (
                <div
                  key={c.id}
                  className="course-hover"
                  style={{
                    background: B.white, border: `1.5px solid ${B.light}`,
                    borderRadius: 18, overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 2px 10px rgba(27,43,94,.05)",
                  }}
                >
                  {/* Thumbnail */}
                  <Link href={`/courses/${c.id}`} style={{ display: "block", textDecoration: "none" }}>
                    <CourseThumbnail
                      thumbnailUrl={c.thumbnailUrl}
                      coverEmoji={c.coverEmoji}
                      coverColor={c.coverColor}
                      size={170}
                    />
                  </Link>

                  <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      <Link href={`/courses/${c.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 15, color: B.navy, lineHeight: 1.3 }}>
                          {c.title}
                        </div>
                      </Link>
                      <Pill color={B.navyL}>{c.level}</Pill>
                    </div>

                    <div style={{ fontSize: 12, color: B.gold, fontWeight: 700, marginBottom: 8 }}>{c.subject}</div>

                    <p style={{
                      fontSize: 12.5, color: B.muted, margin: "0 0 12px", flex: 1, lineHeight: 1.6,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                    }}>
                      {c.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <Pill color={B.navy}><BookOpen size={11}/> {c.lessonCount ?? 0} lessons</Pill>
                      <Pill color={B.gold}><Users size={11}/> {c.enrolledCount ?? 0} enrolled</Pill>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/courses/${c.id}`} style={{
                        flex: 1, background: B.navy, color: B.white, textDecoration: "none",
                        textAlign: "center", padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                      }}>
                        {isStaff ? "Manage" : "View Course"}
                      </Link>
                      {isStudent && !enrolled && (
                        <button onClick={() => onEnroll(c.id)} disabled={enroll.isPending} style={{
                          background: `linear-gradient(135deg, ${B.gold}, ${B.goldD})`,
                          color: B.white, border: "none", padding: "9px 16px", borderRadius: 10,
                          fontSize: 13, fontWeight: 800, cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(201,168,76,.3)",
                        }}>
                          Enroll
                        </button>
                      )}
                      {isStudent && enrolled && (
                        <span style={{
                          background: `${B.success}18`, color: B.success,
                          padding: "9px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                          <CheckCircle2 size={13}/> Enrolled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
