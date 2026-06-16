import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useGetCurrentUser, useListCourses } from "@workspace/api-client-react";
import { B } from "@/lib/brand";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout, Card, PrimaryButton, GoldButton, Pill } from "@/components/DashboardLayout";
import {
  ClipboardList, Plus, Upload, X, CheckCircle, Clock,
  AlertTriangle, Eye, Send, ChevronDown, ChevronUp,
  Pencil, Trash2, Image as ImageIcon, MessageSquare,
} from "lucide-react";

type AssignmentType = "homework" | "test" | "project";
type SubmissionStatus = "pending" | "submitted" | "graded" | "returned";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  imageDataUrl: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade?: string;
  feedback?: string;
  gradedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  courseId: string;
  courseName: string;
  assignedTo: string[];
  submissions: Submission[];
}

const STORAGE_KEY = "al_shamail_assignments_v1";

const COURSE_OPTIONS = [
  { id: "english", name: "English" },
  { id: "math", name: "Math" },
  { id: "science", name: "Science" },
  { id: "history", name: "History" },
];

function getCourseName(courseId: string) {
  return COURSE_OPTIONS.find((course) => course.id === courseId)?.name ?? "General";
}

function findCourseName(courseId: string, options: { id: string; name: string }[]) {
  return options.find((course) => course.id === courseId)?.name ?? getCourseName(courseId);
}

function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return (JSON.parse(raw) as Assignment[]).map((assignment) => ({
        ...assignment,
        courseId: assignment.courseId ?? "english",
        courseName: assignment.courseName ?? getCourseName(assignment.courseId ?? "english"),
      }));
    }
  } catch {}
  return [
    {
      id: "asgn-1",
      title: "Chapter 5 – Algebra Review",
      description: "Complete exercises 1–20 on page 112. Show all working.",
      type: "homework",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdBy: "teacher-demo",
      createdByName: "Mr. Al-Rashid",
      createdAt: new Date().toISOString(),
      courseId: "math",
      courseName: "Math",
      assignedTo: [],
      submissions: [],
    },
    {
      id: "asgn-2",
      title: "Mid-term Science Test",
      description: "Covers chapters 3–7. Estimated 45 minutes. Submit your answer sheet as a clear photo.",
      type: "test",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdBy: "teacher-demo",
      createdByName: "Ms. Khalil",
      createdAt: new Date().toISOString(),
      courseId: "science",
      courseName: "Science",
      assignedTo: [],
      submissions: [],
    },
  ];
}

function saveAssignments(list: Assignment[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

const NOTIFICATIONS_KEY = "al_shamail_assignment_notifications_v1";

function loadSubmissionNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

function saveSubmissionNotifications(list: string[]) {
  try { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list)); } catch {}
}

function pushSubmissionNotification(notification: string) {
  const current = loadSubmissionNotifications();
  const next = [notification, ...current].slice(0, 10);
  saveSubmissionNotifications(next);
  return next;
}

function clearSubmissionNotifications() {
  saveSubmissionNotifications([]);
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function duePill(iso: string, status?: SubmissionStatus) {
  if (status === "returned" || status === "graded")
    return { label: "Graded", color: B.success };
  if (status === "submitted")
    return { label: "Submitted", color: B.navy };
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: "Overdue", color: B.error };
  if (days === 0) return { label: "Due today", color: B.warning };
  if (days <= 3) return { label: `Due in ${days}d`, color: B.warning };
  return { label: `Due ${new Date(iso).toLocaleDateString()}`, color: B.muted };
}

function typeBadge(t: AssignmentType) {
  const map: Record<AssignmentType, { label: string; color: string }> = {
    homework: { label: "Homework", color: B.navy },
    test:     { label: "Test",     color: "#7c3aed" },
    project:  { label: "Classwork", color: "#0369a1" },
  };
  return map[t];
}

function assignmentTypeLabel(t: AssignmentType) {
  return t === "project" ? "Classwork" : t === "homework" ? "Homework" : "Test";
}

function groupAssignmentsByCourse(assignments: Assignment[]) {
  const groups = new Map<string, { courseId: string; courseName: string; items: Assignment[] }>();
  assignments.forEach((assignment) => {
    const courseId = assignment.courseId ?? "english";
    const courseName = assignment.courseName ?? getCourseName(courseId);
    const group = groups.get(courseId) ?? { courseId, courseName, items: [] };
    group.items.push(assignment);
    groups.set(courseId, group);
  });
  return Array.from(groups.values()).sort((a, b) => a.courseName.localeCompare(b.courseName));
}

function ImageUploader({
  onImage,
  existing,
}: {
  onImage: (dataUrl: string) => void;
  existing?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(existing);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onImage(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        style={{
          border: `2px dashed ${dragging ? B.gold : B.line}`,
          borderRadius: 14,
          padding: preview ? 0 : "32px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? `${B.gold}10` : B.offW,
          transition: "all .15s",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="submission"
            style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: "block" }}
          />
        ) : (
          <>
            <Upload size={28} style={{ color: B.muted, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, color: B.navy, fontSize: 14 }}>
              Drop your image here or click to browse
            </div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 4 }}>
              JPG, PNG, WEBP — max 5 MB
            </div>
          </>
        )}
        {preview && (
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(undefined); onImage(""); }}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

function AssignmentForm({
  initial,
  courseOptions,
  onSave,
  onCancel,
}: {
  initial?: Partial<Assignment>;
  courseOptions: { id: string; name: string }[];
  onSave: (data: Omit<Assignment, "id" | "createdAt" | "createdBy" | "createdByName" | "submissions">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [type, setType] = useState<AssignmentType>(initial?.type ?? "homework");
  const [courseId, setCourseId] = useState(initial?.courseId ?? courseOptions[0]?.id ?? COURSE_OPTIONS[0].id);
  useEffect(() => {
    if (!initial && courseOptions.length > 0) {
      setCourseId(courseOptions[0].id);
    }
  }, [courseOptions, initial]);

  const [due, setDue] = useState(
    initial?.dueDate
      ? initial?.dueDate.slice(0, 10)
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  );

  const inp: React.CSSProperties = {
    width: "100%", background: B.offW, border: `1.5px solid ${B.line}`,
    borderRadius: 10, padding: "10px 12px", fontSize: 13,
    fontFamily: "inherit", color: B.text, outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Title *
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chapter 5 Homework" style={{ ...inp, marginTop: 6 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Type
          </label>
          <select value={type} onChange={(e) => setType(e.target.value as AssignmentType)}
            style={{ ...inp, marginTop: 6, cursor: "pointer" }}>
            <option value="homework">Homework</option>
            <option value="test">Test</option>
            <option value="project">Classwork</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Subject
          </label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
            style={{ ...inp, marginTop: 6, cursor: "pointer" }}>
            {courseOptions.length > 0 ? (
              courseOptions.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))
            ) : (
              <option value="">No courses available</option>
            )}
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Instructions
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="Describe what students need to do…"
          style={{ ...inp, marginTop: 6, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onCancel} style={{
          padding: "10px 16px", border: `1px solid ${B.line}`, borderRadius: 10,
          background: B.offW, color: B.muted, fontWeight: 600, fontSize: 13,
          cursor: "pointer", fontFamily: "inherit",
        }}>Cancel</button>
        <GoldButton
          onClick={() => {
            if (!title.trim()) return;
            onSave({
            title: title.trim(),
            description: desc.trim(),
            type,
            dueDate: new Date(due).toISOString(),
            courseId,
            courseName: findCourseName(courseId, courseOptions),
            assignedTo: [],
          });
          }}
        >
          <CheckCircle size={14} /> Save Assignment
        </GoldButton>
      </div>
    </div>
  );
}

function SubmissionViewer({
  submission,
  onSave,
  onReturn,
  onDelete,
  onClose,
  editable,
}: {
  submission: Submission;
  onSave: (id: string, grade: string, feedback: string, imageDataUrl: string) => void;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  editable?: boolean;
}) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [imagePreview, setImagePreview] = useState(submission.imageDataUrl);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const isReturned = submission.status === "returned" || submission.status === "graded";

  const inp: React.CSSProperties = {
    width: "100%", background: B.offW, border: `1.5px solid ${B.line}`,
    borderRadius: 10, padding: "10px 12px", fontSize: 13,
    fontFamily: "inherit", color: B.text, outline: "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: B.white, borderRadius: 20, maxWidth: 680,
        width: "100%", maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,.3)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${B.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: B.white, zIndex: 1,
        }}>
          <div>
            <div style={{ fontWeight: 800, color: B.navy, fontSize: 16 }}>
              {submission.studentName}'s Submission
            </div>
            <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 9, border: `1px solid ${B.line}`,
            background: B.offW, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: B.muted,
          }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{
            border: `1px solid ${B.line}`, borderRadius: 14, overflow: "hidden",
            background: B.offW,
          }}>
            <img
              src={imagePreview}
              alt="student submission"
              style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 380 }}
            />
          </div>

          {editable && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditingImage((current) => !current)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 16px", borderRadius: 12, border: `1px solid ${B.line}`,
                  background: B.offW, color: B.muted, fontWeight: 700, cursor: "pointer",
                }}
              >
                {isEditingImage ? "Cancel image edit" : "Edit image"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(submission.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 16px", borderRadius: 12, border: `1px solid #fecaca`,
                  background: "#fef2f2", color: B.error, fontWeight: 700, cursor: "pointer",
                }}
              >
                <Trash2 size={16} /> Delete submission
              </button>
            </div>
          )}

          {isEditingImage && (
            <div>
              <ImageUploader existing={imagePreview} onImage={setImagePreview} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Grade
                </label>
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 85/100"
                  disabled={isReturned}
                  style={{ ...inp, marginTop: 6, opacity: isReturned ? .7 : 1 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Write feedback for the student…"
                  disabled={isReturned}
                  style={{ ...inp, marginTop: 6, resize: "vertical", opacity: isReturned ? .7 : 1 }}
                />
              </div>
            </div>

            {!isReturned && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <GoldButton onClick={() => onSave(submission.id, grade, feedback, imagePreview)}>
                  <Send size={13} /> Save and return
                </GoldButton>
                <button
                  type="button"
                  onClick={() => onReturn(submission.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "11px 16px", borderRadius: 12, border: `1px solid ${B.line}`,
                    background: B.offW, color: B.muted, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <AlertTriangle size={13} /> Return without editing
                </button>
              </div>
            )}

            {isReturned && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10,
                background: `${B.success}12`, border: `1px solid ${B.success}44`,
                color: B.success, fontWeight: 700, fontSize: 13,
              }}>
                <CheckCircle size={15} />
                Returned on {new Date(submission.gradedAt!).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentFeedbackModal({
  submission,
  assignmentTitle,
  onClose,
}: {
  submission: Submission;
  assignmentTitle: string;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: B.white, borderRadius: 20, maxWidth: 560,
        width: "100%", maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,.3)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${B.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: B.white, zIndex: 1,
        }}>
          <div style={{ fontWeight: 800, color: B.navy, fontSize: 16 }}>{assignmentTitle}</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 9, border: `1px solid ${B.line}`,
            background: B.offW, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: B.muted,
          }}><X size={15} /></button>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            border: `1px solid ${B.line}`, borderRadius: 14, overflow: "hidden",
          }}>
            <img src={submission.imageDataUrl} alt="your submission"
              style={{ width: "100%", objectFit: "contain", maxHeight: 280, display: "block" }} />
          </div>
          {submission.grade && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: `${B.gold}14`, border: `1px solid ${B.gold}44`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: B.goldD, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                Grade
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: B.navy }}>{submission.grade}</div>
            </div>
          )}
          {submission.feedback && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: B.offW, border: `1px solid ${B.line}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: B.muted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
                Teacher's Feedback
              </div>
              <div style={{ fontSize: 14, color: B.text, lineHeight: 1.6 }}>{submission.feedback}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const me = useGetCurrentUser();
  const user = me.data?.user;
  const isAdmin = !!user?.isAdmin;
  const isTeacher = !isAdmin && user?.role === "teacher";
  const isStudent = !isAdmin && !isTeacher;

  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments);
  useEffect(() => { saveAssignments(assignments); }, [assignments]);

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadImageFor, setUploadImageFor] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<string>("");
  const [viewSubmission, setViewSubmission] = useState<{ sub: Submission; asgn: Assignment } | null>(null);
  const [viewFeedback, setViewFeedback] = useState<{ sub: Submission; title: string } | null>(null);
  const [filterType, setFilterType] = useState<"all" | AssignmentType>("all");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const coursesQuery = useListCourses();
  const courseOptions = useMemo(() => {
    const items = coursesQuery.data?.items ?? COURSE_OPTIONS;
    return items.map((course: any) => ({
      id: String(course.id),
      name: course.subject || course.title || course.name || `Course ${course.id}`,
    }));
  }, [coursesQuery.data?.items]);

  const userId = (user as any)?.id ?? "current-user";
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Student";
  const [pendingNotifications, setPendingNotifications] = useState<string[]>(() =>
    (isTeacher || isAdmin) ? loadSubmissionNotifications() : [],
  );

  useEffect(() => {
    if ((isTeacher || isAdmin) && pendingNotifications.length > 0) {
      pendingNotifications.forEach((notification) => {
        toast({ title: "New student submission", description: notification });
      });
      clearSubmissionNotifications();
      setPendingNotifications([]);
    }
  }, [isTeacher, isAdmin, pendingNotifications]);

  const createAssignment = useCallback(
    (data: Omit<Assignment, "id" | "createdAt" | "createdBy" | "createdByName" | "submissions">) => {
      const newA: Assignment = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
        createdBy: userId,
        createdByName: fullName,
        submissions: [],
      };
      setAssignments((prev) => [newA, ...prev]);
      setShowCreate(false);
    },
    [userId, fullName],
  );

  const updateAssignment = useCallback(
    (id: string, data: Omit<Assignment, "id" | "createdAt" | "createdBy" | "createdByName" | "submissions">) => {
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      setEditId(null);
    },
    [],
  );

  const deleteAssignment = useCallback((id: string) => {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const submitWork = useCallback(
    (assignmentId: string) => {
      if (!uploadImage) return;
      const sub: Submission = {
        id: uid(),
        studentId: userId,
        studentName: fullName,
        imageDataUrl: uploadImage,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      };
      setAssignments((prev) => prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const filtered = a.submissions.filter((s) => s.studentId !== userId);
        return { ...a, submissions: [...filtered, sub] };
      }));
      const assignment = assignments.find((a) => a.id === assignmentId);
      const assignmentLabel = assignment ? assignmentTypeLabel(assignment.type) : "assignment";
      const notificationText = `${fullName} submitted ${assignmentLabel} for ${assignment?.title ?? "an assignment"}`;
      pushSubmissionNotification(notificationText);
      setUploadImageFor(null);
      setUploadImage("");
      toast({
        title: "Submission sent",
        description: assignment
          ? `Successfully submitted ${assignmentLabel} 👍`
          : "Submission sent 👍",
      });
    },
    [userId, fullName, uploadImage, assignments],
  );

  const saveSubmission = useCallback(
    (assignmentId: string, submissionId: string, grade: string, feedback: string, imageDataUrl: string) => {
      setAssignments((prev) => prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.id === submissionId
              ? {
                  ...s,
                  grade,
                  feedback,
                  imageDataUrl,
                  status: "returned",
                  gradedAt: new Date().toISOString(),
                }
              : s,
          ),
        };
      }));
      setViewSubmission(null);
    },
    [],
  );

  const deleteSubmission = useCallback(
    (assignmentId: string, submissionId: string) => {
      if (!confirm("Delete this submission? This cannot be undone.")) return;
      setAssignments((prev) => prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return { ...a, submissions: a.submissions.filter((s) => s.id !== submissionId) };
      }));
      setViewSubmission(null);
    },
    [],
  );

  const returnSubmission = useCallback(
    (assignmentId: string, submissionId: string) => {
      setAssignments((prev) => prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.id === submissionId
              ? { ...s, status: "returned", gradedAt: new Date().toISOString() }
              : s,
          ),
        };
      }));
      setViewSubmission(null);
    },
    [],
  );

  const gradeSubmission = useCallback(
    (assignmentId: string, submissionId: string, grade: string, feedback: string) => {
      setAssignments((prev) => prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.id === submissionId
              ? { ...s, grade, feedback, status: "returned", gradedAt: new Date().toISOString() }
              : s,
          ),
        };
      }));
      setViewSubmission(null);
    },
    [],
  );

  const visibleAssignments = assignments.filter(
    (a) => filterType === "all" || a.type === filterType,
  );
  const groupedAssignments = groupAssignmentsByCourse(visibleAssignments);

  return (
    <DashboardLayout
      title="Assignments"
      subtitle={
        isStudent
          ? "Your homework, tests, and classwork"
          : isTeacher
          ? "Manage assignments and review submissions"
          : "Assignments — admin view"
      }
      action={
        !isStudent ? (
          <GoldButton onClick={() => { setShowCreate(true); setEditId(null); }}>
            <Plus size={14} /> New Assignment
          </GoldButton>
        ) : undefined
      }
    >
      {(showCreate || editId) && (
        <div style={{ marginBottom: 24 }}>
          <Card title={editId ? "Edit Assignment" : "Create Assignment"}>
            <AssignmentForm
              initial={editId ? assignments.find((a) => a.id === editId) : undefined}
              courseOptions={courseOptions}
              onSave={(data) => editId ? updateAssignment(editId, data) : createAssignment(data)}
              onCancel={() => { setShowCreate(false); setEditId(null); }}
            />
          </Card>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "homework", "test", "project"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: "7px 16px", borderRadius: 99,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              background: filterType === t
                ? `linear-gradient(135deg, ${B.navy}, ${B.navyL})`
                : B.offW,
              color: filterType === t ? B.white : B.muted,
              border: `1px solid ${filterType === t ? "transparent" : B.line}`,
              transition: "all .15s",
            }}
          >
            {t === "all"
              ? "All"
              : t === "homework"
              ? "Homework"
              : t === "test"
              ? "Test"
              : "Classwork"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: B.muted, alignSelf: "center" }}>
          {visibleAssignments.length} assignment{visibleAssignments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {visibleAssignments.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: B.white, borderRadius: 20, border: `1px solid ${B.line}`,
        }}>
          <ClipboardList size={36} style={{ color: B.muted, opacity: .4, marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: B.navy, fontSize: 15 }}>No assignments yet</div>
          <div style={{ color: B.muted, fontSize: 13, marginTop: 4 }}>
            {isStudent ? "Check back soon." : "Create one using the button above."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groupedAssignments.map((group) => {
            const isOpen = expandedCourseId === group.courseId;
            return (
              <div key={group.courseId} style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${B.line}` }}>
                <button
                  type="button"
                  onClick={() => setExpandedCourseId(isOpen ? null : group.courseId)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    padding: "18px 20px",
                    background: B.white,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `${B.navy}12`, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: B.navy,
                      flexShrink: 0,
                    }}>
                      <ClipboardList size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: B.navy, fontSize: 15 }}>{group.courseName}</div>
                      <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
                        {group.items.length} {group.items.length === 1 ? "assignment" : "assignments"}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: B.muted, display: "flex", alignItems: "center" }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px", background: B.offW2 }}>
                    {group.items.map((a) => {
                      const mySubmission = isStudent
                        ? a.submissions.find((s) => s.studentId === userId)
                        : undefined;
                      const dp = duePill(a.dueDate, mySubmission?.status);
                      const tb = typeBadge(a.type);
                      const isExpanded = expandedId === a.id;
                      const submissionCount = a.submissions.length;
                      const pendingCount = a.submissions.filter((s) => s.status === "submitted").length;

                      return (
                        <div
                          key={a.id}
                          style={{
                            background: B.white, borderRadius: 18,
                            border: `1px solid ${B.line}`,
                            boxShadow: "0 6px 18px rgba(27,43,94,.05)",
                            overflow: "hidden",
                            transition: "box-shadow .2s",
                          }}
                        >
                          <div
                            style={{
                              padding: "18px 20px",
                              display: "flex", alignItems: "flex-start", gap: 14,
                              cursor: "pointer",
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          >
                            <div style={{
                              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                              background: `${tb.color}14`,
                              border: `1px solid ${tb.color}28`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tb.color,
                            }}>
                              <ClipboardList size={18} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 800, fontSize: 15, color: B.navy }}>{a.title}</span>
                                <Pill color={tb.color}>{tb.label}</Pill>
                                <span style={{
                                  fontSize: 11, fontWeight: 700, padding: "3px 9px",
                                  borderRadius: 99, background: `${dp.color}14`,
                                  border: `1px solid ${dp.color}44`, color: dp.color,
                                }}>
                                  {dp.color === B.error && <AlertTriangle size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />}
                                  {dp.label}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: B.muted, marginTop: 4 }}>
                                {a.description.slice(0, 100)}{a.description.length > 100 ? "…" : ""}
                              </div>
                              {!isStudent && (
                                <div style={{ fontSize: 11, color: B.muted, marginTop: 5 }}>
                                  <span style={{ fontWeight: 700, color: B.navy }}>{submissionCount}</span> submission{submissionCount !== 1 ? "s" : ""}
                                  {pendingCount > 0 && (
                                    <span style={{ marginLeft: 6, color: B.warning, fontWeight: 700 }}>
                                      · {pendingCount} awaiting review
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                              {isStudent && mySubmission?.status === "returned" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewFeedback({ sub: mySubmission, title: a.title });
                                  }}
                                  style={{
                                    padding: "6px 12px", borderRadius: 9,
                                    background: `${B.success}14`, color: B.success,
                                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
                                    border: `1px solid ${B.success}44`,
                                  }}
                                >
                                  <MessageSquare size={12} /> View Feedback
                                </button>
                              )}

                              {(isAdmin || isTeacher) && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditId(a.id); setShowCreate(false); }}
                                    style={{
                                      width: 32, height: 32, borderRadius: 8, border: `1px solid ${B.line}`,
                                      background: B.offW, cursor: "pointer", display: "flex",
                                      alignItems: "center", justifyContent: "center", color: B.muted,
                                    }}
                                  ><Pencil size={13} /></button>
                                  {isAdmin && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteAssignment(a.id); }}
                                      style={{
                                        width: 32, height: 32, borderRadius: 8, border: `1px solid #fecaca`,
                                        background: "#fef2f2", cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center", color: B.error,
                                      }}
                                    ><Trash2 size={13} /></button>
                                  )}
                                </>
                              )}

                              <div style={{ color: B.muted }}>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div style={{
                              borderTop: `1px solid ${B.line}`,
                              padding: "20px",
                              background: B.offW2,
                            }}>
                              <div style={{
                                fontSize: 13, color: B.text, lineHeight: 1.7,
                                marginBottom: 18, padding: "14px 16px",
                                background: B.white, borderRadius: 12, border: `1px solid ${B.line}`,
                              }}>
                                {a.description || "No instructions provided."}
                              </div>

                              <div style={{ fontSize: 11, color: B.muted, marginBottom: 16 }}>
                                Posted by <strong>{a.createdByName}</strong> · Due {new Date(a.dueDate).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                              </div>

                              {isStudent && (
                                <div>
                                  {!mySubmission ? (
                                    <>
                                      {uploadImageFor === a.id ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                          <ImageUploader onImage={setUploadImage} />
                                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                            <button
                                              onClick={() => { setUploadImageFor(null); setUploadImage(""); }}
                                              style={{
                                                padding: "9px 14px", border: `1px solid ${B.line}`,
                                                borderRadius: 9, background: B.offW, color: B.muted,
                                                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                                              }}
                                            >Cancel</button>
                                            <PrimaryButton onClick={() => submitWork(a.id)} disabled={!uploadImage}>
                                              <Send size={13} /> Submit
                                            </PrimaryButton>
                                          </div>
                                        </div>
                                      ) : (
                                        <GoldButton onClick={() => setUploadImageFor(a.id)}>
                                          <Upload size={13} /> Upload & Submit
                                        </GoldButton>
                                      )}
                                    </>
                                  ) : (
                                    <div style={{
                                      display: "flex", alignItems: "center", gap: 10,
                                      padding: "12px 16px", borderRadius: 12,
                                      background: mySubmission.status === "returned"
                                        ? `${B.success}10` : `${B.navy}10`,
                                      border: `1px solid ${mySubmission.status === "returned"
                                        ? B.success + "44" : B.navy + "44"}`,
                                      flexWrap: "wrap",
                                    }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {mySubmission.status === "returned"
                                          ? <CheckCircle size={15} style={{ color: B.success }} />
                                          : <Clock size={15} style={{ color: B.navy }} />}
                                        <span style={{
                                          fontWeight: 700, fontSize: 13,
                                          color: mySubmission.status === "returned" ? B.success : B.navy,
                                        }}>
                                          {mySubmission.status === "returned"
                                            ? "Graded — tap 'View Feedback' to see your result"
                                            : "Submitted — awaiting teacher review"}
                                        </span>
                                      </div>
                                      <div style={{
                                        width: 48, height: 48, borderRadius: 8, overflow: "hidden",
                                        border: `1px solid ${B.line}`, marginLeft: "auto",
                                      }}>
                                        <img src={mySubmission.imageDataUrl} alt="preview"
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {(isTeacher || isAdmin) && (
                                <div>
                                  <div style={{
                                    fontSize: 13, fontWeight: 700, color: B.navy,
                                    marginBottom: 10,
                                  }}>
                                    Submissions ({a.submissions.length})
                                  </div>
                                  {a.submissions.length === 0 ? (
                                    <div style={{
                                      fontSize: 13, color: B.muted, padding: "16px",
                                      textAlign: "center", background: B.white,
                                      borderRadius: 10, border: `1px solid ${B.line}`,
                                    }}>
                                      No submissions yet
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      {a.submissions.map((sub) => (
                                        <div
                                          key={sub.id}
                                          style={{
                                            display: "flex", alignItems: "center", gap: 12,
                                            padding: "12px 14px", background: B.white,
                                            borderRadius: 12, border: `1px solid ${B.line}`,
                                          }}>
                                          <div style={{
                                            width: 44, height: 44, borderRadius: 8, overflow: "hidden",
                                            border: `1px solid ${B.line}`, flexShrink: 0,
                                          }}>
                                            <img src={sub.imageDataUrl} alt=""
                                              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                          </div>

                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: B.navy }}>
                                              {sub.studentName}
                                            </div>
                                            <div style={{ fontSize: 11, color: B.muted, marginTop: 1 }}>
                                              {new Date(sub.submittedAt).toLocaleString()}
                                            </div>
                                          </div>

                                          {sub.status === "returned" ? (
                                            <span style={{
                                              fontSize: 11, fontWeight: 700, padding: "3px 9px",
                                              borderRadius: 99, background: `${B.success}14`,
                                              border: `1px solid ${B.success}44`, color: B.success,
                                            }}>
                                              Graded{sub.grade ? ` · ${sub.grade}` : ""}
                                            </span>
                                          ) : (
                                            <span style={{
                                              fontSize: 11, fontWeight: 700, padding: "3px 9px",
                                              borderRadius: 99, background: `${B.warning}14`,
                                              border: `1px solid ${B.warning}44`, color: B.warning,
                                            }}>
                                              Awaiting Review
                                            </span>
                                          )}

                                          <button
                                            onClick={() => setViewSubmission({ sub, asgn: a })}
                                            style={{
                                              padding: "7px 12px", border: "none", borderRadius: 9,
                                              background: `linear-gradient(135deg, ${B.navy}, ${B.navyL})`,
                                              color: B.white, fontWeight: 700, fontSize: 12,
                                              cursor: "pointer", display: "flex", alignItems: "center",
                                              gap: 5, fontFamily: "inherit",
                                            }}>
                                            <Eye size={12} />
                                            {sub.status === "returned" ? "View" : "Review"}
                                          </button>
                                          <button
                                            onClick={() => deleteSubmission(a.id, sub.id)}
                                            style={{
                                              padding: "7px 12px", borderRadius: 9,
                                              border: `1px solid ${B.line}`,
                                              background: B.offW, color: B.error,
                                              display: "flex", alignItems: "center", gap: 5,
                                              fontWeight: 700, fontSize: 12, cursor: "pointer",
                                              fontFamily: "inherit",
                                            }}>
                                            <Trash2 size={12} />
                                            Delete
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewSubmission && (
        <SubmissionViewer
          submission={viewSubmission.sub}
          onSave={(submissionId, grade, feedback, imageDataUrl) =>
            saveSubmission(viewSubmission.asgn.id, submissionId, grade, feedback, imageDataUrl)
          }
          onReturn={(submissionId) => returnSubmission(viewSubmission.asgn.id, submissionId)}
          onDelete={(submissionId) => deleteSubmission(viewSubmission.asgn.id, submissionId)}
          onClose={() => setViewSubmission(null)}
          editable={isTeacher || isAdmin}
        />
      )}
      {viewFeedback && (
        <StudentFeedbackModal
          submission={viewFeedback.sub}
          assignmentTitle={viewFeedback.title}
          onClose={() => setViewFeedback(null)}
        />
      )}
    </DashboardLayout>
  );
}
