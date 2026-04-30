import { Component, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { B } from "@/lib/brand";
import Home from "@/pages/Home";
import Apply from "@/pages/Apply";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import DashboardRedirect from "@/pages/DashboardRedirect";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminApplications from "@/pages/AdminApplications";
import AdminUsers from "@/pages/AdminUsers";
import TeacherStudents from "@/pages/TeacherStudents";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetail from "@/pages/CourseDetail";
import LessonView from "@/pages/LessonView";
import QuizView from "@/pages/QuizView";
import SchedulePage from "@/pages/SchedulePage";
import BadgesPage from "@/pages/BadgesPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import ProfilePage from "@/pages/ProfilePage";
import MessagesPage from "@/pages/MessagesPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
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
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
