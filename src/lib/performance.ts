// Performance scoring — computed ONLY from data we actually have (duty, schedule
// compliance, discipline, complaints). Un-measurable dimensions (professionalism,
// leadership, etc.) are intentionally omitted rather than fabricated.
//
// Weights are configurable constants, not hardcoded score values.

export const PERF_WEIGHTS = { activity: 0.4, reliability: 0.35, conduct: 0.25 };
export const WEEKLY_DUTY_TARGET_SECONDS = 5 * 3600; // 5 one-hour slots / week

export interface PerfInputs {
  last7dSeconds: number;
  scheduledPast: number;   // scheduled slots this week already elapsed
  scheduledCovered: number;// of those, how many were actually covered
  activeDiscipline: number;// active disciplinary records
  finalOrWorse: number;    // active final_warning / suspension / demotion / termination
  openComplaints: number;  // open complaints against them
}

export interface PerfResult {
  activity: number;
  reliability: number | null;
  conduct: number;
  overall: number;
  grade: "A" | "B" | "C" | "D" | "F";
  risk: "low" | "medium" | "high";
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computePerformance(i: PerfInputs): PerfResult {
  // Activity: duty hours vs weekly target
  const activity = clamp((i.last7dSeconds / WEEKLY_DUTY_TARGET_SECONDS) * 100);

  // Reliability: schedule compliance (null if they had no elapsed scheduled slots)
  const reliability = i.scheduledPast > 0 ? clamp((i.scheduledCovered / i.scheduledPast) * 100) : null;

  // Conduct: starts at 100, penalised by active discipline & open complaints
  const conduct = clamp(100 - i.activeDiscipline * 20 - i.finalOrWorse * 15 - i.openComplaints * 10);

  // Overall: weighted average over AVAILABLE components (renormalise if reliability is null)
  let wSum = PERF_WEIGHTS.activity + PERF_WEIGHTS.conduct + (reliability !== null ? PERF_WEIGHTS.reliability : 0);
  let score = PERF_WEIGHTS.activity * activity + PERF_WEIGHTS.conduct * conduct + (reliability !== null ? PERF_WEIGHTS.reliability * reliability : 0);
  const overall = clamp(score / wSum);

  const grade = overall >= 85 ? "A" : overall >= 70 ? "B" : overall >= 55 ? "C" : overall >= 40 ? "D" : "F";

  const risk: PerfResult["risk"] =
    i.finalOrWorse > 0 || i.openComplaints >= 2 || overall < 40 ? "high" :
    i.activeDiscipline > 0 || overall < 55 ? "medium" : "low";

  return { activity, reliability, conduct, overall, grade, risk };
}
