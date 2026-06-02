import { StaticPageShell } from "@/pages/StaticPage";

const B = {
  navy: "#1B2B5E",
  light: "#E8EBF4",
  offW: "#F8F6F1",
  text: "#1a1a2e",
};

export default function EnrollmentFees() {
  return (
    <StaticPageShell title="Fee Details" tag="Enrollment">
      <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${B.light}`, background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ background: B.navy, color: "#fff" }}>
              {["Programme", "Age group", "Monthly", "Annual"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "14px 18px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { prog: "Foundation", age: "Ages 4–6", monthly: "£55 / month", annual: "£550 / year" },
              { prog: "Primary Standard", age: "Ages 7–10", monthly: "£75 / month", annual: "£750 / year" },
              { prog: "Primary Plus", age: "Ages 7–10", monthly: "£95 / month", annual: "£950 / year" },
              { prog: "Junior Secondary", age: "Ages 11–13", monthly: "£115 / month", annual: "£1,150 / year" },
              { prog: "Senior Secondary", age: "Ages 13–16", monthly: "£135 / month", annual: "£1,350 / year" },
            import React from "react";
            import { StaticPageShell } from "@/pages/StaticPage";

            const B = {
              navy: "#1B2B5E",
              navyL: "#243570",
              gold: "#C9A84C",
              goldD: "#A8873A",
              goldL: "#E8C96A",
              offW: "#F8F6F1",
              text: "#1a1a2e",
              muted: "#64748b",
              light: "#E8EBF4",
              green: "#16a34a",
              greenL: "#f0fdf4",
              amber: "#d97706",
              amberL: "#fffbeb",
              blue: "#2563eb",
              blueL: "#eff6ff",
              purple: "#7c3aed",
              purpleL: "#f5f3ff",
            };

            function Section({
              icon,
              title,
              accent = B.navy,
              children,
            }: {
              icon: string;
              title: string;
              accent?: string;
              children: React.ReactNode;
            }) {
              return (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: `1px solid ${B.light}`,
                    overflow: "hidden",
                    marginBottom: 28,
                    boxShadow: "0 2px 12px rgba(27,43,94,.06)",
                  }}
                >
                  <div
                    style={{
                      background: accent,
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#fff",
                        fontFamily: "'Playfair Display', serif",
                        letterSpacing: ".01em",
                      }}
                    >
                      {title}
                    </h2>
                  </div>
                  <div style={{ padding: "24px" }}>{children}</div>
                </div>
              );
            }

            function Badge({ label, color = B.gold }: { label: string; color?: string }) {
              return (
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: color + "22",
                    color: color,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                  }}
                >
                  {label}
                </span>
              );
            }

            function InfoCard({
              icon,
              title,
              value,
              note,
              bg = B.blueL,
              accent = B.blue,
            }: {
              icon: string;
              title: string;
              value: string;
              note?: string;
              bg?: string;
              accent?: string;
            }) {
              return (
                <div
                  style={{
                    background: bg,
                    borderRadius: 12,
                    border: `1px solid ${accent}33`,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 24 }}>{icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: B.navy, fontFamily: "'Playfair Display', serif" }}>{value}</div>
                  {note && <div style={{ fontSize: 12, color: B.muted, lineHeight: 1.5 }}>{note}</div>}
                </div>
              );
            }

            export default function EnrollmentFees() {
              return (
                <StaticPageShell title="Fee Structure 2026–2027" tag="Enrollment & Fees">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 16,
                      marginBottom: 32,
                    }}
                  >
                    <InfoCard icon="🎓" title="Starting From" value="300 SR / mo" note="Grades 1–5" bg={B.blueL} accent={B.blue} />
                    <InfoCard icon="📝" title="Registration" value="300 SR" note="One-time per student" bg={B.amberL} accent={B.amber} />
                    <InfoCard icon="👨‍👩‍👧‍👦" title="Sibling Discount" value="Up to 15%" note="For 4+ children" bg={B.greenL} accent={B.green} />
                    <InfoCard icon="🏆" title="Merit Scholarship" value="Up to 25%" note="For 95%+ achievers" bg={B.purpleL} accent={B.purple} />
                  </div>

                  <Section icon="📚" title="Monthly Tuition Fees" accent={B.navy}>
                    <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${B.light}` }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                        <thead>
                          <tr style={{ background: B.offW }}>
                            {["Class / Programme", "Monthly Fee (SR)", "Annual (10 months)"].map((h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: "left",
                                  padding: "12px 18px",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: ".07em",
                                  color: B.muted,
                                  borderBottom: `2px solid ${B.light}`,
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { prog: "KG I, KG II, KG III", monthly: 350, highlight: false },
                            { prog: "Grade 1 – Grade 5", monthly: 300, highlight: false },
                            import React from "react";
                            import { StaticPageShell } from "@/pages/StaticPage";

                            const B = {
                              navy: "#1B2B5E",
                              navyL: "#243570",
                              gold: "#C9A84C",
                              goldD: "#A8873A",
                              goldL: "#E8C96A",
                              offW: "#F8F6F1",
                              text: "#1a1a2e",
                              muted: "#64748b",
                              light: "#E8EBF4",
                              green: "#16a34a",
                              greenL: "#f0fdf4",
                              amber: "#d97706",
                              amberL: "#fffbeb",
                              blue: "#2563eb",
                              blueL: "#eff6ff",
                              purple: "#7c3aed",
                              purpleL: "#f5f3ff",
                            };

                            function Section({
                              icon,
                              title,
                              accent = B.navy,
                              children,
                            }: {
                              icon: string;
                              title: string;
                              accent?: string;
                              children: React.ReactNode;
                            }) {
                              return (
                                <div
                                  style={{
                                    background: "#fff",
                                    borderRadius: 16,
                                    border: `1px solid ${B.light}`,
                                    overflow: "hidden",
                                    marginBottom: 28,
                                    boxShadow: "0 2px 12px rgba(27,43,94,.06)",
                                  }}
                                >
                                  <div
                                    style={{
                                      background: accent,
                                      padding: "16px 24px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                    }}
                                  >
                                    <span style={{ fontSize: 22 }}>{icon}</span>
                                    <h2
                                      style={{
                                        margin: 0,
                                        fontSize: 17,
                                        fontWeight: 900,
                                        color: "#fff",
                                        fontFamily: "'Playfair Display', serif",
                                        letterSpacing: ".01em",
                                      }}
                                    >
                                      {title}
                                    </h2>
                                  </div>
                                  <div style={{ padding: "24px" }}>{children}</div>
                                </div>
                              );
                            }

                            function Badge({ label, color = B.gold }: { label: string; color?: string }) {
                              return (
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 10px",
                                    borderRadius: 999,
                                    background: color + "22",
                                    color: color,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    letterSpacing: ".04em",
                                  }}
                                >
                                  {label}
                                </span>
                              );
                            }

                            function InfoCard({
                              icon,
                              title,
                              value,
                              note,
                              bg = B.blueL,
                              accent = B.blue,
                            }: {
                              icon: string;
                              title: string;
                              value: string;
                              note?: string;
                              bg?: string;
                              accent?: string;
                            }) {
                              return (
                                <div
                                  style={{
                                    background: bg,
                                    borderRadius: 12,
                                    border: `1px solid ${accent}33`,
                                    padding: "18px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                  }}
                                >
                                  <div style={{ fontSize: 24 }}>{icon}</div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</div>
                                  <div style={{ fontSize: 22, fontWeight: 900, color: B.navy, fontFamily: "'Playfair Display', serif" }}>{value}</div>
                                  {note && <div style={{ fontSize: 12, color: B.muted, lineHeight: 1.5 }}>{note}</div>}
                                </div>
                              );
                            }

                            export default function EnrollmentFees() {
                              return (
                                <StaticPageShell title="Fee Structure 2026–2027" tag="Enrollment & Fees">
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                      gap: 16,
                                      marginBottom: 32,
                                    }}
                                  >
                                    <InfoCard icon="🎓" title="Starting From" value="300 SR / mo" note="Grades 1–5" bg={B.blueL} accent={B.blue} />
                                    <InfoCard icon="📝" title="Registration" value="300 SR" note="One-time per student" bg={B.amberL} accent={B.amber} />
                                    <InfoCard icon="👨‍👩‍👧‍👦" title="Sibling Discount" value="Up to 15%" note="For 4+ children" bg={B.greenL} accent={B.green} />
                                    <InfoCard icon="🏆" title="Merit Scholarship" value="Up to 25%" note="For 95%+ achievers" bg={B.purpleL} accent={B.purple} />
                                  </div>
                          <div style={{ fontSize: 12, color: item.accent + "99", marginBottom: 10 }}>{item.sub}</div>
                          <div style={{ fontSize: 36, fontWeight: 900, color: "#78350f", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                            {item.discount}
                          </div>
                          <div style={{ fontSize: 11, color: item.accent, marginTop: 4, fontWeight: 600 }}>discount on tuition</div>
                          {item.extra && (
                            <div
                              style={{
                                marginTop: 10,
                                padding: "6px 10px",
                                background: "#fff",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#92400e",
                              }}
                            >
                              {item.extra}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section icon="🏆" title="Merit Scholarship Program" accent={B.purple}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: B.navy, marginBottom: 12 }}>Academic Excellence Scholarship</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                        {[
                          { range: "95% and above", scholarship: "25%", color: "#7c3aed", bg: "#f5f3ff" },
                          { range: "90% – 94%", scholarship: "15%", color: "#6d28d9", bg: "#ede9fe" },
                          { range: "85% – 89%", scholarship: "10%", color: "#5b21b6", bg: "#ddd6fe" },
                        ].map((item) => (
                          <div
                            key={item.range}
                            style={{
                              background: item.bg,
                              borderRadius: 12,
                              padding: "18px",
                              border: `1px solid ${item.color}33`,
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                              Score: {item.range}
                            </div>
                            <div style={{ fontSize: 34, fontWeight: 900, color: item.color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                              {item.scholarship}
                            </div>
                            <div style={{ fontSize: 11, color: item.color, marginTop: 4 }}>Tuition Scholarship</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ marginTop: 10, fontSize: 12, color: B.muted }}>
                        ✦ Scholarship is reviewed every term based on academic performance.
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: 20,
                        background: B.purpleL,
                        borderRadius: 12,
                        border: `1px solid ${B.purple}22`,
                        padding: "20px",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: B.navy, marginBottom: 4 }}>Need-Based Scholarship</div>
                      <div style={{ fontSize: 12, color: B.muted, marginBottom: 16 }}>Al Shamail Education Support Program — for deserving families</div>
                      <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${B.light}` }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                          <thead>
                            <tr style={{ background: B.navy }}>
                              {[
                                "Category",
                                "Fee Waiver",
                              ].map((h) => (
                                <th
                                  key={h}
                                  style={{
                                    textAlign: "left",
                                    padding: "11px 16px",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: "#fff",
                                    textTransform: "uppercase",
                                    letterSpacing: ".06em",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { cat: "High Need", waiver: "Up to 50%", color: B.purple },
                              { cat: "Moderate Need", waiver: "Up to 30%", color: "#6d28d9" },
                              { cat: "Special Cases (Orphans / Widows)", waiver: "Up to 75%", color: "#5b21b6" },
                            ].map((row, i) => (
                              <tr key={row.cat} style={{ background: i % 2 === 0 ? "#fff" : B.purpleL }}>
                                <td style={{ padding: "13px 16px", fontWeight: 700, color: B.text, borderBottom: `1px solid ${B.light}` }}>{row.cat}</td>
                                <td style={{ padding: "13px 16px", borderBottom: `1px solid ${B.light}` }}>
                                  <Badge label={row.waiver} color={row.color} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: B.navy, marginBottom: 8 }}>Application Requirements:</div>
                        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                          {[
                            "Completed application form",
                            "Income proof documentation",
                            "Interview with academy management",
                          ].map((req) => (
                            <li key={req} style={{ fontSize: 13, color: B.text, lineHeight: 1.6 }}>
                              {req}
                            </li>
                          ))}
                        </ul>
                        <div
                          style={{
                            marginTop: 12,
                            padding: "10px 14px",
                            background: "#fef3c7",
                            borderRadius: 8,
                            border: "1px solid #fde68a",
                            fontSize: 12,
                            color: "#92400e",
                            fontWeight: 600,
                          }}
                        >
                          ⚠️ Limited seats available each academic year.
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section icon="🔗" title="Referral Program" accent="#0891b2">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                      {[
                        { trigger: "Refer 1 Student", reward: "50 SR", sub: "tuition credit", icon: "👤", bg: "#ecfeff", accent: "#0891b2" },
                        { trigger: "Refer 3 Students", reward: "200 SR", sub: "tuition credit", icon: "👥", bg: "#cffafe", accent: "#0e7490" },
                        {
                          trigger: "Refer 5 Students",
                          reward: "1 Month",
                          sub: "free tuition (max. 1 child)",
                          icon: "🎉",
                          bg: "#a5f3fc",
                          accent: "#155e75",
                        },
                      ].map((item) => (
                        <div
                          key={item.trigger}
                          style={{
                            background: item.bg,
                            borderRadius: 12,
                            padding: "20px",
                            border: `1px solid ${item.accent}33`,
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: item.accent, marginBottom: 6 }}>{item.trigger}</div>
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 900,
                              color: item.accent,
                              fontFamily: "'Playfair Display', serif",
                              lineHeight: 1,
                            }}
                          >
                            {item.reward}
                          </div>
                          <div style={{ fontSize: 11, color: item.accent, marginTop: 4, opacity: 0.8 }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <div
                    style={{
                      background: `linear-gradient(135deg, ${B.navy}, ${B.navyL})`,
                      borderRadius: 16,
                      padding: "28px 28px",
                      marginBottom: 28,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: `0 8px 32px rgba(27,43,94,.25)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background: B.gold + "18",
                        top: -60,
                        right: -60,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: B.goldL + "12",
                        bottom: -30,
                        left: 80,
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          background: B.gold,
                          borderRadius: 999,
                          padding: "5px 16px",
                          marginBottom: 14,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>⭐</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: ".1em" }}>
                          Founder Offer
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          fontSize: 22,
                          fontWeight: 900,
                          color: "#fff",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        For the First 100 Students
                      </h3>
                      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                        Join early and lock in exclusive founding member benefits.
                      </p>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {[
                          { icon: "📝", text: "Registration Fee: 300 SR" },
                          { icon: "💰", text: "First Month Tuition: 10% Discount" },
                          { icon: "🎓", text: "Free Orientation Classes" },
                        ].map((item) => (
                          <div
                            key={item.text}
                            style={{
                              background: "rgba(255,255,255,.1)",
                              borderRadius: 10,
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              border: "1px solid rgba(255,255,255,.15)",
                              flex: "1 1 180px",
                            }}
                          >
                            <span style={{ fontSize: 20 }}>{item.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p style={{ textAlign: "center", color: B.muted, fontSize: 13, lineHeight: 1.8, marginTop: 8 }}>
                    For inquiries about scholarships, payment plans, or enrollment, please contact our admissions team.
                    <br />
                    Fees are subject to review each academic year.
                  </p>
                </StaticPageShell>
              );
            }


