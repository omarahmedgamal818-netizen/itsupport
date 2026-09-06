export type StepKind = "check" | "action" | "handoff";

export type PlaybookStep = {
  id: string;
  label: string;
  detail: string;
  kind: StepKind;
  remediations: string[];
  failDiagnosis: string;
};

export type SessionStep = PlaybookStep & {
  status: "pending" | "running" | "passed" | "failed";
  finding: string | null;
};

export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type IssueClassification = {
  category: string;
  device: string;
  priority: IssuePriority;
};

export function toSessionSteps(steps: PlaybookStep[]): SessionStep[] {
  return steps.map((step, index) => ({
    ...step,
    status: index === 0 ? "running" : "pending",
    finding: null,
  }));
}
