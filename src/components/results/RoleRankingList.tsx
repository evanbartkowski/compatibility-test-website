import type { ScoredAssessmentResult } from "@/lib/assessment/types";

export function RoleRankingList({ result }: { result: ScoredAssessmentResult }) {
  const roles = result.roleRankings || [];
  if (roles.length === 0) return null;
  const top = roles.slice(0, 5);
  const groups = [...new Set(roles.map((r) => r.group))];
  return (
    <section className="result-card" aria-labelledby="role-ranking-title">
      <h2 id="role-ranking-title" className="font-display">Your pattern</h2>
      <p>
        {top.map((r) => `${r.label} ${r.percent}%`).join(", ")}.
        {" "}
        {top[0] ? top[0].you : ""}
      </p>
      {groups.map((group) => (
        <div key={group}>
          <h3>{group}</h3>
          <ol>
            {roles.filter((r) => r.group === group).map((role) => (
              <li key={role.key}>
                <strong>{role.label}</strong> {role.percent}%
                <p>{role.you}</p>
                <p>Things you might want to try: {role.try.join("; ")}.</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
