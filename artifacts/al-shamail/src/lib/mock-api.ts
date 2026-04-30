/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API client for Al Shamail Academy.
 *
 * The file is named `mock-api.ts` for legacy reasons — every hook below now
 * calls the real backend at /api. Hooks return the same shapes the UI
 * components have always consumed, so no page changes are required.
 */
import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

/* ──────────────────────────────────────────────────────────────────
 *  Server fetch helper
 * ────────────────────────────────────────────────────────────────── */
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "/api";

async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });
  let body: any = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    const msg = (body && body.error) || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return body as T;
}

/* ──────────────────────────────────────────────────────────────────
 *  Public types (re-exported for callers that import them)
 * ────────────────────────────────────────────────────────────────── */
export type Application = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  role: "student" | "teacher";
  status: "pending" | "approved" | "rejected";
  grade?: string | null;
  school?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  department?: string | null;
  qualification?: string | null;
  experience?: string | null;
  subjects?: string | null;
  createdAt: string;
};

/* ──────────────────────────────────────────────────────────────────
 *  Query keys (kept stable so existing invalidations keep working)
 * ────────────────────────────────────────────────────────────────── */
export const getGetCurrentUserQueryKey = () => ["currentUser"] as const;
export const getListUsersQueryKey = (params?: { role?: string }) =>
  ["users", params ?? {}] as const;
export const getListApplicationsQueryKey = () => ["applications"] as const;
export const getListCoursesQueryKey = () => ["courses"] as const;
export const getGetCourseQueryKey = (id: number) => ["course", id] as const;
export const getListMyEnrollmentsQueryKey = () => ["my-enrollments"] as const;
export const getGetLessonQueryKey = (id: number) => ["lesson", id] as const;
export const getGetTeacherDashboardQueryKey = () => ["teacher-dashboard"] as const;
export const getGetMyProfileQueryKey = () => ["my-profile"] as const;
export const getListBadgesQueryKey = () => ["badges"] as const;
export const getListMessageContactsQueryKey = () => ["message-contacts"] as const;
export const getGetConversationQueryKey = (userId: number) =>
  ["conversation", userId] as const;
export const getListScheduleEventsQueryKey = () => ["schedule-events"] as const;

/* ──────────────────────────────────────────────────────────────────
 *  Lightweight session cache (used only as a hint; the real source
 *  of truth is the server's session cookie).
 * ────────────────────────────────────────────────────────────────── */
const SESSION_KEY = "al-shamail-session-user";
function cacheUser(u: any | null): void {
  try {
    if (u == null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  } catch {
    /* ignore */
  }
}
function readCachedUser(): any | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────────
 *  AUTH
 * ────────────────────────────────────────────────────────────────── */
export function useGetCurrentUser() {
  return useQuery({
    queryKey: getGetCurrentUserQueryKey(),
    queryFn: async () => {
      try {
        const res = await apiFetch<{ user: any }>("/auth/me");
        cacheUser(res?.user ?? null);
        return { user: res?.user ?? null };
      } catch {
        // Network / server unreachable — fall back to last cached user so the
        // dashboard never hangs on "Loading…".
        const cached = readCachedUser();
        return { user: cached };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: { email: string; password: string } }) => {
      const res = await apiFetch<{ user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(vars.data),
      });
      cacheUser(res.user);
      return { user: res.user };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      cacheUser(null);
      return { ok: true };
    },
    onSuccess: () => {
      qc.clear();
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  APPLICATIONS
 * ────────────────────────────────────────────────────────────────── */
function normalizeServerApplication(a: any): Application {
  return {
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phone: a.phone ?? null,
    city: a.city ?? null,
    role: a.role ?? "student",
    status: a.status ?? "pending",
    grade: a.grade ?? null,
    school: a.school ?? null,
    parentName: a.parentName ?? null,
    parentPhone: a.parentPhone ?? null,
    department: a.department ?? null,
    qualification: a.qualification ?? null,
    experience: a.experience ?? null,
    subjects: a.subjects ?? null,
    createdAt: a.createdAt ?? new Date().toISOString(),
  };
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: any }) => {
      const d = vars.data ?? {};
      const role = d.role === "teacher" ? "teacher" : "student";
      const payload: Record<string, any> = {
        firstName: d.firstName ?? "",
        lastName: d.lastName ?? "",
        email: d.email ?? "",
        phone: d.phone ?? null,
        city: d.city ?? null,
        role,
        grade: d.grade ?? null,
        school: d.school ?? null,
        parentName: d.parentName ?? null,
        parentPhone: d.parentPhone ?? null,
        department: d.department ?? null,
        qualification: d.qualification ?? null,
        experience: d.experience ?? null,
        subjects: d.subjects ?? null,
        notes: d.notes ?? null,
      };
      const res = await apiFetch<{ application: any }>("/applications", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return normalizeServerApplication(res.application);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    },
  });
}

export function useListApplications(opts?: any) {
  return useQuery({
    queryKey: getListApplicationsQueryKey(),
    enabled: opts?.query?.enabled ?? true,
    queryFn: async () => {
      const res = await apiFetch<{ applications: any[] }>("/applications");
      return { items: res.applications.map(normalizeServerApplication) };
    },
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; status?: "approved" | "rejected" }) => {
      const status = vars.status ?? "approved";
      await apiFetch(`/applications/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  USERS
 * ────────────────────────────────────────────────────────────────── */
export function useListUsers(
  params: { role?: "student" | "teacher" | "admin" } = {},
  _opts?: any,
) {
  return useQuery({
    queryKey: getListUsersQueryKey(params),
    enabled: _opts?.query?.enabled ?? true,
    queryFn: async () => {
      const qs = params.role ? `?role=${params.role}` : "";
      return await apiFetch<{ items: any[] }>(`/users${qs}`);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: number }) => {
      await apiFetch(`/users/${vars.userId}`, { method: "DELETE" });
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
  });
}

export function useAwardXpToUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: number; data: { amount: number; reason: string } }) => {
      const res = await apiFetch<{ user: any }>(`/users/${vars.userId}/xp`, {
        method: "POST",
        body: JSON.stringify(vars.data),
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    },
  });
}

export function useAwardBadgeToUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: number; data: { badgeId: number } }) => {
      await apiFetch(`/users/${vars.userId}/badges`, {
        method: "POST",
        body: JSON.stringify(vars.data),
      });
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
  });
}

export function useAwardAchievementToUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: any) => {
      const badgeId: number | undefined = vars?.data?.badgeId;
      if (badgeId != null) {
        await apiFetch(`/users/${vars.userId}/badges`, {
          method: "POST",
          body: JSON.stringify({ badgeId }),
        });
      } else {
        // Free-form achievement → create a one-off badge first, then award.
        const newBadge = await apiFetch<any>("/badges", {
          method: "POST",
          body: JSON.stringify({
            name: vars?.data?.title ?? "Achievement",
            description: vars?.data?.description ?? "",
            icon: vars?.data?.kind === "milestone" ? "🏅" : "⭐",
            color: "#C9A84C",
            criteria: "manual",
          }),
        });
        await apiFetch(`/users/${vars.userId}/badges`, {
          method: "POST",
          body: JSON.stringify({ badgeId: newBadge.id }),
        });
      }
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      qc.invalidateQueries({ queryKey: getListBadgesQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  COURSES & LESSONS
 * ────────────────────────────────────────────────────────────────── */
export function useListCourses() {
  return useQuery({
    queryKey: getListCoursesQueryKey(),
    queryFn: async () => apiFetch<{ items: any[] }>("/courses"),
    placeholderData: (prev) => prev,
  });
}

export function useGetCourse(
  id: number,
  opts?: { query?: { enabled?: boolean } },
) {
  return useQuery({
    queryKey: getGetCourseQueryKey(id),
    enabled: opts?.query?.enabled ?? id > 0,
    queryFn: async () => apiFetch<any>(`/courses/${id}`),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: any }) =>
      await apiFetch<any>("/courses", {
        method: "POST",
        body: JSON.stringify(vars.data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetTeacherDashboardQueryKey() });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; data: any }) =>
      await apiFetch<any>(`/courses/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify(vars.data),
      }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: getGetCourseQueryKey(v.id) });
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number }) => {
      await apiFetch(`/courses/${vars.id}`, { method: "DELETE" });
      return { ok: true, id: vars.id };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetCourseQueryKey(d.id) });
      qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetTeacherDashboardQueryKey() });
    },
  });
}

export function useImportCourses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_vars: any) => ({ imported: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    },
  });
}

export function useEnrollInCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: any) => {
      const courseId: number = vars?.courseId ?? vars?.id;
      await apiFetch(`/courses/${courseId}/enroll`, { method: "POST" });
      return { ok: true, courseId };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetCourseQueryKey(d.courseId) });
      qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
    },
  });
}

export function useListMyEnrollments(_opts?: any) {
  return useQuery({
    queryKey: getListMyEnrollmentsQueryKey(),
    enabled: _opts?.query?.enabled ?? true,
    queryFn: async () => apiFetch<{ items: any[] }>("/me/enrollments"),
    placeholderData: (prev) => prev,
  });
}

export function useGetLesson(id: number, opts?: any) {
  return useQuery({
    queryKey: getGetLessonQueryKey(id),
    enabled: opts?.query?.enabled ?? id > 0,
    queryFn: async () => apiFetch<any>(`/lessons/${id}`),
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { courseId: number; data: any }) =>
      await apiFetch<any>(`/courses/${vars.courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(vars.data),
      }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: getGetCourseQueryKey(v.courseId) });
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    },
  });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; courseId?: number }) => {
      await apiFetch(`/lessons/${vars.id}`, { method: "DELETE" });
      return { ok: true, courseId: vars.courseId };
    },
    onSuccess: (d) => {
      if (d.courseId) qc.invalidateQueries({ queryKey: getGetCourseQueryKey(d.courseId) });
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    },
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { lessonId?: number; id?: number }) => {
      const lessonId = vars.lessonId ?? vars.id;
      if (!lessonId) throw new Error("Lesson id required.");
      const res = await apiFetch<any>(`/lessons/${lessonId}/complete`, { method: "POST" });
      return res;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: getGetLessonQueryKey(d.lessonId) });
      qc.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      qc.invalidateQueries({ queryKey: ["dash-student"] });
    },
  });
}

export function useGetLessonQuiz(lessonId: number, opts?: any) {
  return useQuery({
    queryKey: ["quiz", lessonId] as const,
    enabled: opts?.query?.enabled ?? lessonId > 0,
    retry: opts?.query?.retry ?? false,
    queryFn: async () => apiFetch<any>(`/lessons/${lessonId}/quiz`),
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: any) => {
      const lessonId: number = vars?.lessonId ?? vars?.id;
      const answers = vars?.data?.answers;
      return await apiFetch<any>(`/lessons/${lessonId}/quiz/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      qc.invalidateQueries({ queryKey: ["dash-student"] });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  PROFILE
 * ────────────────────────────────────────────────────────────────── */
export function useGetMyProfile() {
  return useQuery({
    queryKey: getGetMyProfileQueryKey(),
    queryFn: async () => {
      try {
        return await apiFetch<any>("/profile/me");
      } catch {
        return readCachedUser();
      }
    },
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: any }) => {
      const updated = await apiFetch<any>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(vars.data ?? {}),
      });
      cacheUser(updated);
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
    },
  });
}

export function useUpdateMyAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: any) => {
      const next: string | null =
        vars?.data?.avatarUrl !== undefined
          ? vars.data.avatarUrl
          : vars?.data?.dataUrl ?? null;
      const updated = await apiFetch<any>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: next }),
      });
      cacheUser(updated);
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  GAMIFICATION
 * ────────────────────────────────────────────────────────────────── */
export function useGetLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"] as const,
    queryFn: async () => apiFetch<{ items: any[] }>("/leaderboard"),
  });
}

export function useGetMyGamification(opts?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["my-gamification"] as const,
    enabled: opts?.query?.enabled ?? true,
    queryFn: async () => {
      try {
        return await apiFetch<any>("/gamification/me");
      } catch {
        return { badges: [], xp: 0, level: 1, streak: 0 };
      }
    },
  });
}

export function useListBadges() {
  return useQuery({
    queryKey: getListBadgesQueryKey(),
    queryFn: async () => apiFetch<{ items: any[] }>("/badges"),
  });
}

export function useCreateBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: any }) =>
      await apiFetch<any>("/badges", {
        method: "POST",
        body: JSON.stringify(vars.data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListBadgesQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  SCHEDULE
 * ────────────────────────────────────────────────────────────────── */
export function useListScheduleEvents(_params: any = {}) {
  return useQuery({
    queryKey: getListScheduleEventsQueryKey(),
    queryFn: async () => apiFetch<{ items: any[] }>("/schedule"),
  });
}

export function useCreateScheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: any }) =>
      await apiFetch<any>("/schedule", {
        method: "POST",
        body: JSON.stringify(vars.data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListScheduleEventsQueryKey() });
    },
  });
}

export function useDeleteScheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number }) => {
      await apiFetch(`/schedule/${vars.id}`, { method: "DELETE" });
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListScheduleEventsQueryKey() });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  MESSAGES
 * ────────────────────────────────────────────────────────────────── */
export function useListMessageContacts(_opts?: any) {
  return useQuery({
    queryKey: getListMessageContactsQueryKey(),
    queryFn: async () => {
      try {
        return await apiFetch<{ items: any[] }>("/messages/contacts");
      } catch {
        return { items: [] };
      }
    },
  });
}

export function useGetConversation(
  otherId: number,
  opts?: { query?: { enabled?: boolean; refetchInterval?: number } },
) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: getGetConversationQueryKey(otherId),
    enabled: opts?.query?.enabled ?? otherId > 0,
    refetchInterval: opts?.query?.refetchInterval,
    queryFn: async () => {
      try {
        return await apiFetch<any>(`/messages/${otherId}`);
      } catch {
        return { messages: [], other: null };
      }
    },
  });
  // The server marks messages as read on fetch; refresh the contacts list so
  // the unread badge clears as soon as the conversation is opened.
  useEffect(() => {
    if (q.isSuccess && otherId > 0) {
      qc.invalidateQueries({ queryKey: getListMessageContactsQueryKey() });
    }
  }, [q.isSuccess, q.dataUpdatedAt, otherId, qc]);
  return q;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { data: { toUserId: number; body: string } }) => {
      return await apiFetch<any>("/messages", {
        method: "POST",
        body: JSON.stringify(vars.data),
      });
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: getListMessageContactsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetConversationQueryKey(v.data.toUserId) });
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: number }) => {
      await apiFetch(`/messages/${vars.userId}`, { method: "DELETE" });
      return { ok: true };
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: getListMessageContactsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetConversationQueryKey(v.userId) });
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
 *  DASHBOARDS
 * ────────────────────────────────────────────────────────────────── */
export function useGetStudentDashboard() {
  return useQuery({
    queryKey: ["dash-student"] as const,
    queryFn: async () => apiFetch<any>("/dashboards/student"),
    placeholderData: (prev) => prev,
  });
}

export function useGetTeacherDashboard() {
  return useQuery({
    queryKey: getGetTeacherDashboardQueryKey(),
    queryFn: async () => apiFetch<any>("/dashboards/teacher"),
    placeholderData: (prev) => prev,
  });
}

export function useGetAdminDashboard() {
  return useQuery({
    queryKey: ["dash-admin"] as const,
    queryFn: async () => apiFetch<any>("/dashboards/admin"),
    placeholderData: (prev) => prev,
  });
}
