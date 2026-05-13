import { Component, Suspense, lazy, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { B } from "@/lib/brand";
const Home = lazy(() => import("@/pages/Home"));
const Apply = lazy(() => import("@/pages/Apply"));
const Login = lazy(() => import("@/pages/Login"));
const Admin = lazy(() => import("@/pages/Admin"));
const DashboardRedirect = lazy(() => import("@/pages/DashboardRedirect"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminApplications = lazy(() => import("@/pages/AdminApplications"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const TeacherStudents = lazy(() => import("@/pages/TeacherStudents"));
const CoursesPage = lazy(() => import("@/pages/CoursesPage"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const LessonView = lazy(() => import("@/pages/LessonView"));
const QuizView = lazy(() => import("@/pages/QuizView"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const BadgesPage = lazy(() => import("@/pages/BadgesPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const AboutPublic = lazy(() => import("@/pages/AboutPublic"));
const ContactPublic = lazy(() => import("@/pages/ContactPublic"));
const CoursesInfo = lazy(() => import("@/pages/CoursesInfo"));
const TeachersPublic = lazy(() => import("@/pages/TeachersPublic"));
const SyllabusBookList = lazy(() => import("@/pages/SyllabusBookList"));
const SyllabusSemesters = lazy(() => import("@/pages/SyllabusSemesters"));
const EnrollmentRules = lazy(() => import("@/pages/EnrollmentRules"));
const EnrollmentFees = lazy(() => import("@/pages/EnrollmentFees"));
const EnrollmentDocuments = lazy(() => import("@/pages/EnrollmentDocuments"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60_000,
    },
  },
});

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled app error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 24,
            background: `linear-gradient(180deg, ${B.offW} 0%, ${B.offW2} 100%)`,
            color: B.text,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: B.white,
              border: `1px solid ${B.line}`,
              borderRadius: 24,
              boxShadow: "0 18px 44px rgba(27,43,94,.1)",
              padding: 32,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: B.goldD,
                textTransform: "uppercase",
                letterSpacing: ".16em",
                marginBottom: 12,
              }}
            >
              Al Shamail
            </div>
            <h1
              style={{
                margin: 0,
                color: B.navy,
                fontFamily: "'Playfair Display', serif",
                fontSize: 32,
                lineHeight: 1.1,
              }}
            >
              Something went wrong
            </h1>
            <p style={{ margin: "14px 0 0", color: B.muted, fontSize: 15, lineHeight: 1.7 }}>
              The application hit an unexpected error. Refresh the page to try
              again.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <button
                onClick={() => window.location.reload()}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  background: `linear-gradient(135deg, ${B.gold}, ${B.goldD})`,
                  color: B.white,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reload
              </button>
              <button
                onClick={() => {
                  window.location.href = import.meta.env.BASE_URL;
                }}
                style={{
                  border: `1px solid ${B.line}`,
                  borderRadius: 12,
                  padding: "12px 18px",
                  background: B.offW,
                  color: B.navy,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/apply" component={Apply} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={DashboardRedirect} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/students" component={TeacherStudents} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/applications-legacy" component={Admin} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/lessons/:id" component={LessonView} />
      <Route path="/lessons/:id/quiz" component={QuizView} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/badges" component={BadgesPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/messages/:userId" component={MessagesPage} />
      <Route path="/about" component={AboutPublic} />
      <Route path="/contact" component={ContactPublic} />
      <Route path="/courses-info" component={CoursesInfo} />
      <Route path="/teachers" component={TeachersPublic} />
      <Route path="/syllabus/book-list" component={SyllabusBookList} />
      <Route path="/syllabus/semesters" component={SyllabusSemesters} />
      <Route path="/enrollment/rules" component={EnrollmentRules} />
      <Route path="/enrollment/fees" component={EnrollmentFees} />
      <Route path="/enrollment/documents" component={EnrollmentDocuments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Suspense fallback={null}>
              <Router />
            </Suspense>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
