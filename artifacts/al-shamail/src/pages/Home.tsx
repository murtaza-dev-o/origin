import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  Star,
  Zap,
  GraduationCap,
  BookOpen,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { createLucideIcon } from "lucide-react";

// ─── Custom Icons ────────────────────────────────────────────────────────────
const CircleCheckBig = createLucideIcon("circle-check-big", [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
]);
const Globe = createLucideIcon("globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  [
    "path",
    {
      d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
      key: "13o1zl",
    },
  ],
  ["path", { d: "M2 12h20", key: "9i4pu4" }],
]);

const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const t = {
  navy: "#1B2B5E",
  navyD: "#0F1A3C",
  navyL: "#243875",
  gold: "#C9A84C",
  goldL: "#E8C96A",
  goldD: "#A8873A",
  white: "#FFFFFF",
  offW: "#F8F6F1",
  text: "#1a1a2e",
  muted: "#64748b",
  light: "#E8EBF4",
};

// Slide 1 = opening message (uses hero-2 for calmer background + readable stats).
// Slide 2 = “Taught by the Very Best” (uses hero-1 = teacher photo).
const slides = [
  {
    id: 1,
    image: publicUrl("hero-2.jpeg"),
    overlay: "linear-gradient(105deg, rgba(10,22,56,0.92) 0%, rgba(10,22,56,0.68) 55%, rgba(10,22,56,0.32) 100%)",
    tag: "Premium Online Education for Children",
    heading: "Learn.\nGrow.\nExcel.",
    sub: "Give your child a world-class education from home. Expert teachers, a structured curriculum, and a fun, engaging platform designed for young learners to thrive.",
    cta: "Start Your Journey",
    accent: t.gold,
  },
  {
    id: 2,
    image: publicUrl("hero-1.jpeg"),
    overlay: "linear-gradient(105deg, rgba(10,22,56,0.94) 0%, rgba(10,22,56,0.74) 52%, rgba(10,22,56,0.38) 100%)",
    tag: "Expert Teachers, Real Results",
    heading: "Taught by\nthe Very Best",
    sub: "Our passionate, qualified educators bring every subject to life — making learning engaging, meaningful, and tailored to each child's unique needs and learning style.",
    cta: "Meet Our Teachers",
    accent: t.goldL,
  },
  {
    id: 3,
    image: publicUrl("hero-3.jpeg"),
    overlay: "linear-gradient(105deg, rgba(10,22,56,0.90) 0%, rgba(10,22,56,0.60) 55%, rgba(10,22,56,0.25) 100%)",
    tag: "Learn from Anywhere in the World",
    heading: "Study Anytime,\nAnywhere",
    sub: "Our platform adapts to your child's schedule and pace. Access lessons, videos, and quizzes on any device — with progress tracking and rewards to keep them motivated.",
    cta: "Get Started Free",
    accent: t.gold,
  },
];

const features = [
  {
    icon: <BookOpen size={28} />,
    title: "Structured Curriculum",
    desc: "Carefully designed learning paths covering Maths, English, Science and more — from beginner to advanced levels.",
  },
  {
    icon: <GraduationCap size={28} />,
    title: "Qualified Teachers",
    desc: "Learn from experienced, DBS-checked educators who are passionate about making every child succeed.",
  },
  {
    icon: <Globe size={28} />,
    title: "Global Community",
    desc: "Join thousands of students from around the world in a safe, supportive, and encouraging learning environment.",
  },
  {
    icon: <Zap size={28} />,
    title: "Gamified Learning",
    desc: "Children earn XP, unlock badges, and maintain streaks — turning every lesson into something they look forward to.",
  },
  {
    icon: <Clock size={28} />,
    title: "Learn at Your Own Pace",
    desc: "Flexible live and recorded sessions mean your child can learn at the times and pace that work best for your family.",
  },
  {
    icon: <Award size={28} />,
    title: "Certificates & Progress Reports",
    desc: "Track your child's growth with detailed reports and award certificates that celebrate every milestone.",
  },
];

const courses = [
  { emoji: "🔢", title: "Mathematics – Primary Level", level: "Ages 5–11", students: "2,100+", color: t.gold },
  { emoji: "📝", title: "English Language & Literacy", level: "All Ages", students: "1,840+", color: "#60a5fa" },
  { emoji: "🔬", title: "Science Explorers", level: "Ages 7–13", students: "1,320+", color: "#4ade80" },
  { emoji: "🌍", title: "Geography & World Studies", level: "Ages 8–14", students: "780+", color: t.goldL },
  { emoji: "📖", title: "Reading & Comprehension", level: "Ages 5–10", students: "1,560+", color: "#f472b6" },
  { emoji: "💡", title: "Critical Thinking & Problem Solving", level: "Ages 9–14", students: "640+", color: "#a78bfa" },
];

const stats = [
  { val: "10K+", label: "Happy Students", icon: <Users size={22} /> },
  { val: "300+", label: "Expert Teachers", icon: <GraduationCap size={22} /> },
  { val: "150+", label: "Subjects & Courses", icon: <BookOpen size={22} /> },
  { val: "97%", label: "Parent Satisfaction", icon: <Star size={22} /> },
];

const testimonials = [
  {
    name: "Shazia Kashif",
    role: "Parent",
    text: "My son went from struggling with Maths to absolutely loving it. The teachers at Al Shamail are patient, encouraging, and truly gifted at making things click for children.",
    rating: 5,
  },
  {
    name: "Abdul Rehman",
    role: "Student",
    text: "I never liked reading until I joined the English programme here. Now I read every day! The XP and badges make me want to keep going and beat my own score.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Parent",
    text: "The flexibility is incredible. My daughter attends sessions around our schedule and the detailed progress reports mean I always know exactly how she is getting on.",
    rating: 5,
  },
];

function StarRating({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={14} fill={t.gold} color={t.gold} />
      ))}
    </div>
  );
}

export default function Home() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [navOpen, setNavOpen] = useState<null | "syllabus" | "enrollment">(null);

  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [, navigate] = useLocation();

  const goApply = () => navigate("/apply");
  const goLogin = () => navigate("/login");
  const goTo = useCallback(
    (path: string) => {
      setNavOpen(null);
      navigate(path);
    },
    [navigate]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 5500);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [startAutoplay]);

  const goSlide = (i: number) => {
    setSlideIdx(i);
    startAutoplay();
  };
  const prevSlide = () => goSlide((slideIdx - 1 + slides.length) % slides.length);
  const nextSlide = () => goSlide((slideIdx + 1) % slides.length);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[slideIdx];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: t.offW, color: t.text, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        .nav-link { font-size:14px; font-weight:600; color:rgba(255,255,255,.8); text-decoration:none; transition:color .2s; cursor:pointer; }
        .nav-link:hover { color:${t.goldL}; }

        .als-btn-gold { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; border-radius:10px; border:none; background:linear-gradient(135deg,${t.gold},${t.goldD}); color:#fff; font-weight:800; font-size:14px; cursor:pointer; font-family:inherit; transition:all .2s; box-shadow:0 4px 18px rgba(201,168,76,.4); }
        .als-btn-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(201,168,76,.5); }

        .als-btn-outline { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; border-radius:10px; border:2px solid rgba(255,255,255,.5); background:transparent; color:#fff; font-weight:700; font-size:14px; cursor:pointer; font-family:inherit; transition:all .2s; }
        .als-btn-outline:hover { background:rgba(255,255,255,.1); border-color:${t.goldL}; color:${t.goldL}; }

        .als-btn-navy { display:inline-flex; align-items:center; gap:8px; padding:13px 30px; border-radius:10px; border:none; background:${t.navy}; color:#fff; font-weight:700; font-size:14px; cursor:pointer; font-family:inherit; transition:all .2s; }
        .als-btn-navy:hover { background:${t.navyL}; transform:translateY(-1px); }

        .als-feature-card { background:#fff; border:1px solid ${t.light}; border-radius:20px; padding:32px 28px; transition:all .25s; cursor:default; }
        .als-feature-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(27,43,94,.12); border-color:${t.gold}44; }

        .als-course-card { background:#fff; border:1px solid ${t.light}; border-radius:18px; overflow:hidden; transition:all .25s; cursor:pointer; }
        .als-course-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(27,43,94,.12); }

        .als-hero-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:99px; background:rgba(201,168,76,.2); border:1px solid rgba(201,168,76,.4); font-size:12px; font-weight:700; color:${t.goldL}; text-transform:uppercase; letter-spacing:.08em; }

        .als-divider-gold { width:64px; height:3px; border-radius:99px; background:linear-gradient(90deg,${t.gold},${t.goldL}); margin:14px auto 0; }

        .als-nav-dd { position:absolute; top:calc(100% + 10px); left:50%; transform:translateX(-50%); min-width:232px; background:#fff; border:1px solid ${t.light}; border-radius:12px; box-shadow:0 16px 40px rgba(27,43,94,.12); padding:6px 0; z-index:200; }
        .als-nav-dd button { display:flex; align-items:center; gap:10px; width:100%; border:none; background:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:${t.navy}; text-align:left; padding:10px 16px; transition:background .15s,color .15s; }
        .als-nav-dd button:hover { background:rgba(201,168,76,.1); color:${t.goldD}; }

        .als-nav-trigger { display:inline-flex; align-items:center; gap:4px; font-size:14px; font-weight:600; color:${t.navy}; cursor:pointer; transition:color .2s; padding:6px 10px; border:none; border-radius:8px; background:transparent; font-family:inherit; }
        .als-nav-trigger:hover { color:${t.gold}; }
        .als-nav-pill { font-size:14px; font-weight:600; color:${t.navy}; cursor:pointer; padding:6px 10px; border:none; border-radius:8px; background:transparent; font-family:inherit; transition:color .2s; }
        .als-nav-pill:hover { color:${t.gold}; }

        @media (max-width:900px) {
          .als-nav-links { display:none !important; }
          .als-gamif-grid { grid-template-columns:1fr !important; gap:32px !important; }
          .als-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .als-footer-grid { grid-template-columns:1fr !important; gap:28px !important; }
        }
      `}</style>

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#ffffff",
          borderBottom: `1px solid ${scrolled ? t.light : "transparent"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(27,43,94,.1)" : "0 2px 8px rgba(27,43,94,.04)",
          transition: "all .3s ease",
        }}
      >
        <div
          style={{
            height: scrolled ? 4 : 3,
            background: `linear-gradient(90deg, ${t.navy}, ${t.gold}, ${t.goldL}, ${t.gold}, ${t.navy})`,
            transition: "height .3s",
          }}
        />
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: `${scrolled ? "8px" : "12px"} 28px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "padding .3s ease",
            minHeight: scrolled ? 72 : 92,
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src={publicUrl("logo.jpeg")}
              alt="Al Shamail Logo"
              style={{
                height: scrolled ? 56 : 70,
                width: scrolled ? 56 : 70,
                objectFit: "contain",
                flexShrink: 0,
                transition: "all .3s ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div style={{ width: 1, height: scrolled ? 40 : 52, background: t.light, transition: "height .3s" }} />
            <div>
              <div
                style={{
                  fontSize: scrolled ? 18 : 21,
                  fontWeight: 900,
                  color: t.navy,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: "-.01em",
                  lineHeight: 1.1,
                  transition: "font-size .3s",
                }}
              >
                Al Shamail
              </div>
              <div
                style={{
                  fontSize: scrolled ? 9 : 10.5,
                  fontWeight: 700,
                  color: t.gold,
                  textTransform: "uppercase",
                  letterSpacing: ".18em",
                  lineHeight: 1.4,
                  marginTop: 3,
                  transition: "font-size .3s",
                }}
              >
                International Academy
              </div>
              <div
                style={{
                  fontSize: 8.5,
                  fontWeight: 600,
                  color: t.muted,
                  textTransform: "uppercase",
                  letterSpacing: ".22em",
                  marginTop: 1,
                }}
              >
                Online
              </div>
            </div>
          </div>

          <nav ref={navRef} className="als-nav-links" style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }} aria-label="Primary">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="als-nav-trigger"
                aria-expanded={navOpen === "syllabus"}
                aria-haspopup="true"
                onClick={() => setNavOpen((v) => (v === "syllabus" ? null : "syllabus"))}
              >
                Syllabus{" "}
                <span
                  style={{
                    opacity: 0.7,
                    fontSize: 12,
                    transform: navOpen === "syllabus" ? "rotate(180deg)" : "none",
                    display: "inline-block",
                  }}
                >
                  ▾
                </span>
              </button>
              {navOpen === "syllabus" ? (
                <div className="als-nav-dd" role="menu">
                  <button type="button" role="menuitem" onClick={() => goTo("/syllabus/book-list")}>
                    <span>Book List</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => goTo("/syllabus/semesters")}>
                    <span>Semesters</span>
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" className="als-nav-pill" onClick={() => goTo("/about")}>
              About
            </button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="als-nav-trigger"
                aria-expanded={navOpen === "enrollment"}
                aria-haspopup="true"
                onClick={() => setNavOpen((v) => (v === "enrollment" ? null : "enrollment"))}
              >
                Enrollment Hub{" "}
                <span
                  style={{
                    opacity: 0.7,
                    fontSize: 12,
                    transform: navOpen === "enrollment" ? "rotate(180deg)" : "none",
                    display: "inline-block",
                  }}
                >
                  ▾
                </span>
              </button>
              {navOpen === "enrollment" ? (
                <div className="als-nav-dd" role="menu">
                  <button type="button" role="menuitem" onClick={() => goTo("/enrollment/rules")}>
                    <span>Rules &amp; Regulations</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => goTo("/enrollment/fees")}>
                    <span>Fee Details</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => goTo("/enrollment/documents")}>
                    <span>Documents Required</span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => goTo("/teachers")}>
                    <span>Our Teachers</span>
                  </button>
                  <button type="button" role="menuitem" onClick={goApply}>
                    <span>Enroll Now</span>
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" className="als-nav-pill" onClick={() => goTo("/courses-info")}>
              Courses
            </button>
            <button type="button" className="als-nav-pill" onClick={() => goTo("/contact")}>
              Contact
            </button>
          </nav>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goLogin}
              style={{
                padding: scrolled ? "9px 22px" : "11px 26px",
                borderRadius: 10,
                border: `2px solid ${t.navy}`,
                background: "transparent",
                color: t.navy,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.navy;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.navy;
              }}
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(201,168,76,.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={goApply}
              style={{
                padding: scrolled ? "9px 22px" : "11px 26px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${t.gold}, ${t.goldD})`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(201,168,76,.35)",
                transition: "padding .3s",
              }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </header>

      <section style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", paddingTop: 92 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <img
              src={slide.image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: slide.overlay }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.04,
                backgroundImage: `radial-gradient(circle at 20% 80%, ${t.gold} 1px, transparent 1px), radial-gradient(circle at 80% 20%, ${t.goldL} 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 28px",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ maxWidth: 640 }}
            >
              <div className="als-hero-badge" style={{ marginBottom: 20 }}>
                <Sparkles size={12} /> {slide.tag}
              </div>
              <h1
                style={{
                  fontSize: "clamp(38px, 5.5vw, 68px)",
                  fontWeight: 900,
                  color: t.white,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  lineHeight: 1.1,
                  marginBottom: 22,
                  whiteSpace: "pre-line",
                  textShadow: "0 2px 24px rgba(0,0,0,.4)",
                }}
              >
                {slide.heading}
              </h1>
              <p
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,.85)",
                  lineHeight: 1.75,
                  marginBottom: 36,
                  maxWidth: 520,
                  fontWeight: 500,
                }}
              >
                {slide.sub}
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button className="als-btn-gold" onClick={goApply} style={{ fontSize: 15, padding: "14px 32px" }}>
                  {slide.cta} <ArrowRight size={16} />
                </button>
                <button className="als-btn-outline" onClick={goLogin} style={{ fontSize: 15, padding: "14px 28px" }}>
                  Sign In
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust stats: fixed position so layout matches every slide + clears dot nav */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "clamp(92px, 12vh, 128px)",
            zIndex: 18,
            pointerEvents: "none",
          }}
        >
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 640 }}>
              {["10K+ Happy Students", "300+ Expert Teachers", "97% Parent Satisfaction"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.96)",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(15,26,60,0.55)",
                    border: "1px solid rgba(255,255,255,.12)",
                    boxShadow: "0 4px 18px rgba(0,0,0,.25)",
                    textShadow: "0 1px 2px rgba(0,0,0,.35)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <CircleCheckBig size={14} color={t.goldL} strokeWidth={2.25} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.3)",
            background: "rgba(255,255,255,.12)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .2s",
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.3)",
            background: "rgba(255,255,255,.12)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .2s",
          }}
        >
          <ChevronRight size={20} />
        </button>

        <div
          style={{
            position: "absolute",
            bottom: "clamp(18px, 2.8vh, 30px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            gap: 10,
            paddingTop: 10,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === slideIdx ? 28 : 8,
                height: 8,
                borderRadius: 99,
                border: "none",
                background: i === slideIdx ? t.gold : "rgba(255,255,255,.4)",
                cursor: "pointer",
                transition: "all .3s",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 5 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
            <path d="M0 80L1440 80L1440 30C1200 70 960 10 720 40C480 70 240 10 0 30L0 80Z" fill={t.offW} />
          </svg>
        </div>
      </section>

      <section style={{ background: t.navy }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
          <div className="als-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  borderRight: i < stats.length - 1 ? "1px solid rgba(201,168,76,.2)" : "none",
                }}
              >
                <div style={{ color: t.gold, display: "flex", justifyContent: "center", marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: t.white, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>{s.val}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.55)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 28px", background: t.offW }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: t.gold, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>Why Choose Us</div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 900,
                color: t.navy,
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.15,
              }}
            >
              Everything a Young Learner Needs
            </h2>
            <div className="als-divider-gold" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="als-feature-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${t.navy}15, ${t.gold}15)`,
                    border: `1px solid ${t.gold}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t.navy,
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: t.navy, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 28px", background: "#fff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 52,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.gold, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>Our Courses</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: t.navy, fontFamily: "'Playfair Display', serif" }}>Subjects for Every Child</h2>
              <div style={{ width: 52, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${t.gold}, ${t.goldL})`, marginTop: 14 }} />
            </div>
            <button type="button" className="als-btn-navy" onClick={goApply}>
              View All Courses <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
            {courses.map((c, i) => (
              <motion.div
                key={c.title}
                className="als-course-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                onClick={goApply}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goApply();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div style={{ height: 8, background: `linear-gradient(90deg, ${c.color}, ${c.color}99)` }} />
                <div style={{ padding: "22px 22px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `${c.color}15`,
                        border: `1px solid ${c.color}33`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                      }}
                    >
                      {c.emoji}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: `${c.color}15`,
                        color: c.color,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                      }}
                    >
                      {c.level}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: t.navy, marginBottom: 12, lineHeight: 1.3 }}>{c.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.muted, fontWeight: 600 }}>
                      <Users size={13} /> {c.students} students
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={12} fill={t.gold} color={t.gold} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.gold }}>4.9</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goApply();
                    }}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "10px 0",
                      borderRadius: 10,
                      border: `1.5px solid ${c.color}55`,
                      background: `${c.color}08`,
                      color: c.color,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all .15s",
                    }}
                  >
                    Enroll Now <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "80px 28px",
          background: `linear-gradient(135deg, ${t.navyD} 0%, ${t.navy} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle, ${t.gold} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="als-gamif-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.gold, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 14 }}>Designed for Young Learners</div>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.5vw, 40px)",
                  fontWeight: 900,
                  color: t.white,
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.2,
                  marginBottom: 20,
                }}
              >
                Learning That Rewards Every Step
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.7, marginBottom: 32 }}>
                Children learn best when they are motivated. Our gamified platform rewards effort at every stage — turning homework into an adventure and lessons into achievements.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: <Sparkles size={16} />, label: "Earn XP points for completing lessons and quizzes" },
                  { icon: <Trophy size={16} />, label: "Unlock badges and certificates as skills grow" },
                  { icon: <Zap size={16} />, label: "Daily streaks and leaderboards keep children engaged" },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: `${t.gold}22`,
                        border: `1px solid ${t.gold}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: t.gold,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Daily XP Earned", val: "1,240 XP", icon: "⭐", color: t.gold, bg: "rgba(201,168,76,.1)", border: "rgba(201,168,76,.25)" },
                { label: "Current Streak", val: "7 Days 🔥", icon: "🔥", color: "#fb923c", bg: "rgba(251,146,60,.1)", border: "rgba(251,146,60,.25)" },
                { label: "Achievements", val: "12 Unlocked", icon: "🏆", color: "#60a5fa", bg: "rgba(96,165,250,.1)", border: "rgba(96,165,250,.25)" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 22px",
                    borderRadius: 16,
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,.5)",
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        marginBottom: 3,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.val}</div>
                  </div>
                </motion.div>
              ))}
              <button type="button" className="als-btn-gold" onClick={goApply} style={{ alignSelf: "flex-start", fontSize: 14, padding: "13px 28px", marginTop: 4 }}>
                Join &amp; Start Earning XP <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 28px", background: t.offW }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: t.gold, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>Testimonials</div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: t.navy, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>What Our Community Says</h2>
          <div className="als-divider-gold" style={{ margin: "0 auto 52px" }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "#fff",
                border: `1px solid ${t.light}`,
                borderRadius: 24,
                padding: "44px 48px",
                position: "relative",
                boxShadow: "0 8px 40px rgba(27,43,94,.08)",
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  color: t.gold,
                  fontFamily: "serif",
                  lineHeight: 1,
                  position: "absolute",
                  top: 20,
                  left: 32,
                  opacity: 0.35,
                }}
                aria-hidden
              >
                &ldquo;
              </div>
              <StarRating />
              <p
                style={{
                  fontSize: 17,
                  color: t.text,
                  lineHeight: 1.8,
                  marginTop: 18,
                  marginBottom: 28,
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                &ldquo;{testimonials[testimonialIdx].text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.navy}, ${t.navyL})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: t.gold,
                    fontSize: 16,
                  }}
                >
                  {testimonials[testimonialIdx].name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.navy }}>{testimonials[testimonialIdx].name}</div>
                  <div style={{ fontSize: 12, color: t.gold, fontWeight: 700 }}>{testimonials[testimonialIdx].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Show testimonial ${i + 1}`}
                style={{
                  width: i === testimonialIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 99,
                  border: "none",
                  background: i === testimonialIdx ? t.gold : t.light,
                  cursor: "pointer",
                  padding: 0,
                  transition: "all .3s",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "100px 28px",
          background: `linear-gradient(135deg, ${t.navyD}, ${t.navy} 50%, #243875)`,
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(201,168,76,.15)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(201,168,76,.1)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 900,
              color: t.white,
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.15,
              marginBottom: 18,
            }}
          >
            Ready to Give Your Child the Best Start?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.7)", marginBottom: 40, lineHeight: 1.7 }}>
            Join thousands of families already learning with Al Shamail International Academy. Enroll today and watch your child&apos;s confidence and ability grow.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" className="als-btn-gold" onClick={goApply} style={{ fontSize: 15, padding: "15px 36px" }}>
              Get Started Free <ArrowRight size={16} />
            </button>
            <button type="button" className="als-btn-outline" onClick={goLogin} style={{ fontSize: 15, padding: "15px 28px" }}>
              Sign In
            </button>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 20 }}>No credit card required · Free trial available</p>
        </div>
      </section>

      <footer style={{ background: t.navyD, padding: "64px 28px 32px", color: "rgba(255,255,255,.6)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="als-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={publicUrl("logo-full.jpeg")}
                  alt="Al Shamail International Academy"
                  style={{ width: 70, height: 70, objectFit: "contain", display: "block", flexShrink: 0 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: t.white,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      letterSpacing: "-.01em",
                      lineHeight: 1.1,
                    }}
                  >
                    Al Shamail
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.gold,
                      textTransform: "uppercase",
                      letterSpacing: ".18em",
                      lineHeight: 1.4,
                      marginTop: 4,
                    }}
                  >
                    International Academy
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 18, maxWidth: 280, color: "rgba(255,255,255,.5)" }}>
                Providing world-class online education for children of all ages. Structured, fun, and results-driven. Learn. Grow. Excel.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {["📘", "📷", "🐦"].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            {[
              { heading: "Subjects", links: ["Mathematics", "English & Literacy", "Science", "Geography", "Reading & Comprehension", "Critical Thinking"] },
              { heading: "Academy", links: ["About Us", "Our Teachers", "Testimonials", "Blog", "Careers"] },
              { heading: "Support", links: ["Contact Us", "FAQ", "Privacy Policy", "Terms of Service", "Help Center"] },
            ].map((col, i) => (
              <div key={col.heading}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: t.gold, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 18 }}>{col.heading}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link) => (
                    <span
                      key={link}
                      style={{ fontSize: 13, cursor: "pointer", transition: "color .2s", color: "rgba(255,255,255,.6)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.color = t.goldL;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.color = "rgba(255,255,255,.6)";
                      }}
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.08)",
              paddingTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ fontSize: 12 }}>© {new Date().getFullYear()} Al Shamail International Academy. All rights reserved.</p>
            <p style={{ fontSize: 12, color: t.gold }}>Learn · Grow · Excel</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
