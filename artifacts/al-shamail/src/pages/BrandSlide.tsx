import { useState, useEffect } from "react";

const t = {
  navy: "#1B2B5E",
  navyD: "#0F1A3C",
  gold: "#C9A84C",
  goldL: "#E8C96A",
  white: "#FFFFFF",
  offW: "#F8F6F1",
};

const heroBrandBackdrop = `linear-gradient(148deg, #0F1A3C 0%, #1B2B5E 38%, #1e2f6a 72%, #0F1A3C 100%)`;

const stats = [
  { val: "10K+", label: "Happy Students" },
  { val: "300+", label: "Expert Teachers" },
  { val: "97%", label: "Satisfaction" },
];

const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

type VisKey = "logo" | "line" | "text" | "stats" | "pills";

type Particle = {
  x: number;
  y: number;
  size: number;
  op: number;
  delay: number;
  dur: number;
};

export default function BrandSlide() {
  const [vis, setVis] = useState<Record<VisKey, boolean>>({
    logo: false,
    line: false,
    text: false,
    stats: false,
    pills: false,
  });
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 26 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 1.8,
      op: 0.04 + Math.random() * 0.09,
      delay: Math.random() * 3,
      dur: 4 + Math.random() * 4,
    }))
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setVis((v) => ({ ...v, logo: true })), 80),
      setTimeout(() => setVis((v) => ({ ...v, line: true })), 440),
      setTimeout(() => setVis((v) => ({ ...v, text: true })), 680),
      setTimeout(() => setVis((v) => ({ ...v, stats: true })), 920),
      setTimeout(() => setVis((v) => ({ ...v, pills: true })), 1120),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: heroBrandBackdrop,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes rotateSlowR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes glowPulse{0%,100%{opacity:.18}50%{opacity:.35}}
        @keyframes pulseDot{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        .bs-orbit-1{position:absolute;top:50%;left:50%;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;border:1px solid rgba(201,168,76,0.08);pointer-events:none;animation:rotateSlow 80s linear infinite}
        .bs-orbit-dot{position:absolute;top:4%;left:50%;width:7px;height:7px;margin-left:-3.5px;border-radius:50%;background:#C9A84C;box-shadow:0 0 12px rgba(201,168,76,0.9);animation:pulseDot 3s ease-in-out infinite}
        .bs-orbit-2{position:absolute;top:50%;left:50%;width:750px;height:750px;margin:-375px 0 0 -375px;border-radius:50%;border:1px solid rgba(201,168,76,0.04);pointer-events:none;animation:rotateSlowR 120s linear infinite}
        .bs-ring{position:absolute;inset:-14px;border-radius:50%;border:1.5px solid rgba(201,168,76,0.3);animation:rotateSlow 14s linear infinite}
        .bs-ring::after{content:'';position:absolute;top:8%;right:-5px;width:9px;height:9px;border-radius:50%;background:#C9A84C;box-shadow:0 0 12px rgba(201,168,76,0.9)}
        .bs-ring-2{position:absolute;inset:-28px;border-radius:50%;border:1px solid rgba(201,168,76,0.1);animation:rotateSlowR 22s linear infinite}
        .bs-trust-pill{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.88);padding:7px 14px;border-radius:10px;background:rgba(15,26,60,0.55);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(6px)}
      `}</style>

      <div
        style={{
          position: "absolute",
          width: 600,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.14) 0%, transparent 70%)",
          top: -100,
          left: -100,
          animation: "glowPulse 5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(232,201,106,0.08) 0%, transparent 70%)",
          bottom: -80,
          right: -80,
          animation: "glowPulse 7s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />

      <div className="bs-orbit-1">
        <div className="bs-orbit-dot" />
      </div>
      <div className="bs-orbit-2" />

      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: t.goldL,
            opacity: p.op,
            pointerEvents: "none",
            animation: `pulseDot ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, rgba(10,18,48,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "clamp(12px, 2vh, 24px) 28px 72px",
          maxWidth: 640,
          width: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            marginBottom: 32,
            opacity: vis.logo ? 1 : 0,
            transform: vis.logo ? "translateY(0) scale(1)" : "translateY(28px) scale(0.9)",
            transition: "opacity 0.75s cubic-bezier(0.34,1.56,0.64,1), transform 0.75s cubic-bezier(0.34,1.56,0.64,1)",
            animation: vis.logo ? "floatY 7s ease-in-out 0.5s infinite" : "none",
          }}
        >
          <div className="bs-ring-2" />
          <div className="bs-ring" />
          <div
            style={{
              width: 176,
              height: 176,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(12px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
              overflow: "hidden",
            }}
          >
            <img
              src={publicUrl("logo.jpeg")}
              alt="Al Shamail International Academy"
              style={{
                width: 148,
                height: 148,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.3))",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(42px, 7vw, 68px)",
            fontWeight: 900,
            color: t.white,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            margin: 0,
            textShadow: "0 3px 40px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
            opacity: vis.logo ? 1 : 0,
            transform: vis.logo ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.65s ease 0.1s, transform 0.65s ease 0.1s",
          }}
        >
          Al Shamail
        </h1>

        <div
          style={{
            height: 2,
            borderRadius: 99,
            background: `linear-gradient(90deg, transparent, ${t.gold}, ${t.goldL}, ${t.gold}, transparent)`,
            margin: "14px auto",
            width: vis.line ? 220 : 0,
            opacity: vis.line ? 1 : 0,
            transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s",
          }}
        />

        <div
          style={{
            fontSize: "clamp(11px,1.6vw,13.5px)",
            fontWeight: 700,
            color: t.gold,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            opacity: vis.line ? 1 : 0,
            transition: "opacity 0.5s 0.2s",
          }}
        >
          International Academy
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(248,246,241,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            marginTop: 5,
            opacity: vis.line ? 1 : 0,
            transition: "opacity 0.5s 0.3s",
          }}
        >
          Online · KG to A-Level
        </div>

        <p
          style={{
            fontSize: "clamp(15px,2vw,17.5px)",
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.78,
            fontWeight: 500,
            maxWidth: 500,
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            margin: "22px 0 0",
            opacity: vis.text ? 1 : 0,
            transform: vis.text ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
        >
          An online school built for children who deserve{" "}
          <span style={{ color: t.goldL, fontWeight: 700 }}>structure, warmth</span>, and real academic progress.
          Qualified teachers. A clear curriculum. A platform families trust.
        </p>

        <div
          style={{
            display: "flex",
            borderRadius: 18,
            background: "rgba(15,26,60,0.5)",
            border: "1px solid rgba(201,168,76,0.2)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            marginTop: 28,
            width: "100%",
            maxWidth: 480,
            opacity: vis.stats ? 1 : 0,
            transform: vis.stats ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.val}
              style={{
                flex: 1,
                padding: "18px 16px",
                textAlign: "center",
                borderRight: i < stats.length - 1 ? "1px solid rgba(201,168,76,0.15)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(22px,3.5vw,30px)",
                  fontWeight: 900,
                  color: t.gold,
                  lineHeight: 1.1,
                  marginBottom: 4,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.42)",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 20,
            opacity: vis.pills ? 1 : 0,
            transition: "opacity 0.65s ease",
          }}
        >
          {["10K+ Happy Students", "300+ Expert Teachers", "97% Parent Satisfaction"].map((label) => (
            <div key={label} className="bs-trust-pill">
              <span style={{ color: t.goldL }}>✓</span> {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 5 }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
          <path d="M0 60L1440 60L1440 22C1200 52 960 8 720 30C480 52 240 8 0 22L0 60Z" fill={t.offW} />
        </svg>
      </div>
    </div>
  );
}