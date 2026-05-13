import { StaticPageShell } from "@/pages/StaticPage";

export default function EnrollmentRules() {
  return (
    <StaticPageShell title="Rules & Regulations" tag="Enrollment">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {[
          { t: "Attendance", d: "Students are expected to attend the majority of scheduled live sessions. Parents should notify absences via the portal." },
          { t: "Punctuality", d: "Join sessions a few minutes early to avoid disruption to the class." },
          { t: "Respectful behaviour", d: "All students must treat teachers and classmates with courtesy. Bullying or harassment is not tolerated." },
          { t: "Academic integrity", d: "Submitted work must be the student’s own. Dishonesty may lead to disciplinary action." },
          { t: "Online safety", d: "Logins must not be shared. Messaging should remain educational and may be monitored for safety." },
          { t: "Device & internet", d: "A stable connection and suitable device are required for the best learning experience." },
        ].map((r) => (
          <div key={r.t} style={{ background: "#fff", border: "1px solid #E8EBF4", borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 900, color: "#1B2B5E", marginBottom: 8 }}>{r.t}</div>
            <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75 }}>{r.d}</div>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}

