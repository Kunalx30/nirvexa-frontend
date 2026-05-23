// src/components/ui/QuotaBanner.jsx
import { useNavigate } from "react-router-dom";
import { useUsage } from "../../hooks/useUsage";

const LABELS = {
  chat: "AI Chat messages",
  resume_analysis: "Resume ATS analyses",
  resume_build: "Resume builds",
  interview: "Interview sessions",
  career_roadmap: "Career roadmaps",
  roadmap_search: "Roadmap searches",
  job_apply: "Job applications",
  skill_match: "Skill matches",
  company_research: "Company research searches",
  salary_insights: "Salary insight searches",
};

/**
 * Drop this inside any page that has a rate-limited feature.
 *
 * <QuotaBanner feature="chat" />
 * <QuotaBanner feature="resume_build" />
 */
export default function QuotaBanner({ feature }) {
  const { isPremium, remaining, limit, percentUsed, loading } = useUsage();
  const navigate = useNavigate();

  if (loading || isPremium) return null;

  const rem = remaining(feature);
  const lim = limit(feature);
  const pct = percentUsed(feature);
  const label = LABELS[feature] || feature;
  const isExhausted = rem <= 0;

  if (rem === "unlimited" || rem === null) return null;

  const barColor = isExhausted
    ? "bg-red-500"
    : pct >= 80
    ? "bg-amber-400"
    : "bg-indigo-500";

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 text-sm
        ${isExhausted
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
          : "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800"
        }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <span className={isExhausted ? "text-red-700 dark:text-red-400 font-medium" : "text-indigo-700 dark:text-indigo-300"}>
            {isExhausted
              ? `Daily limit reached for ${label}`
              : `${rem} of ${lim} ${label} remaining today`}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate("/pricing")}
        className="shrink-0 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        Upgrade →
      </button>
    </div>
  );
}
