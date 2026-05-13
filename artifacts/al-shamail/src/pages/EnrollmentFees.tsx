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
            ].map((row, i) => (
              <tr key={row.prog} style={{ background: i % 2 === 0 ? "#fff" : B.offW }}>
                <td style={{ padding: "14px 18px", fontWeight: 900, color: B.navy, borderBottom: `1px solid ${B.light}` }}>{row.prog}</td>
                <td style={{ padding: "14px 18px", color: B.text, borderBottom: `1px solid ${B.light}` }}>{row.age}</td>
                <td style={{ padding: "14px 18px", color: B.text, borderBottom: `1px solid ${B.light}` }}>{row.monthly}</td>
                <td style={{ padding: "14px 18px", color: B.text, borderBottom: `1px solid ${B.light}` }}>{row.annual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 14, color: "#64748b", fontSize: 13, lineHeight: 1.7 }}>
        Discounts and payment plans may be available. Please contact admissions for details.
      </p>
    </StaticPageShell>
  );
}

