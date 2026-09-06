import {
  isPerformanceIssue,
  makePerformancePlaybookSteps,
} from "./performance-playbook";
import {
  diagnosisForFinding,
  isConnectivityIssue,
  makeGenericPlaybookSteps,
  makeWifiPlaybookSteps,
} from "./wifi-playbook";
import {
  isAccessIssue,
  isEmailIssue,
  isPrinterIssue,
  isVpnIssue,
  makeAccessPlaybookSteps,
  makeEmailPlaybookSteps,
  makePrinterPlaybookSteps,
  makeVpnPlaybookSteps,
} from "./extra-playbooks";
import type { IssueClassification, SessionStep } from "./playbook-types";

export type {
  IssueClassification,
  IssuePriority,
  PlaybookStep,
  SessionStep,
  StepKind,
} from "./playbook-types";

const DEVICE_PATTERNS: [RegExp, string][] = [
  [/laptop|notebook|macbook|thinkpad|elitebook/i, "Laptop"],
  [/desktop|workstation|tower/i, "Desktop"],
  [/iphone|android|phone|mobile/i, "Phone"],
  [/ipad|tablet/i, "Tablet"],
  [/printer|scanner/i, "Printer"],
  [/monitor|screen|display|projector/i, "Monitor"],
];

function detectDevice(issue: string): string {
  for (const [pattern, device] of DEVICE_PATTERNS) {
    if (pattern.test(issue)) return device;
  }
  return "Laptop";
}

export function classifyIssue(issue: string): IssueClassification {
  const device = detectDevice(issue);

  if (isVpnIssue(issue)) {
    return { category: "Network access", device, priority: "high" };
  }
  if (isAccessIssue(issue)) {
    return { category: "Access", device, priority: "high" };
  }
  if (isEmailIssue(issue)) {
    return { category: "Email", device, priority: "medium" };
  }
  if (isPrinterIssue(issue)) {
    return { category: "Printer", device: device === "Laptop" ? "Printer" : device, priority: "medium" };
  }
  if (isPerformanceIssue(issue)) {
    return { category: "Performance", device, priority: "medium" };
  }
  if (isConnectivityIssue(issue)) {
    return { category: "Connectivity", device, priority: "high" };
  }
  return { category: "General", device, priority: "medium" };
}

export function makePlaybookSteps(issue: string): SessionStep[] {
  if (isVpnIssue(issue)) return makeVpnPlaybookSteps();
  if (isAccessIssue(issue)) return makeAccessPlaybookSteps();
  if (isEmailIssue(issue)) return makeEmailPlaybookSteps();
  if (isPrinterIssue(issue)) return makePrinterPlaybookSteps();
  if (isPerformanceIssue(issue)) return makePerformancePlaybookSteps();
  if (isConnectivityIssue(issue)) return makeWifiPlaybookSteps();
  return makeGenericPlaybookSteps();
}

export function recommendationForFailure(step: SessionStep, finding?: string | null): string {
  const diagnosis = diagnosisForFinding(step.id, finding ?? step.finding) ?? step.failDiagnosis;
  if (step.remediations.length === 0) return diagnosis;
  return `${diagnosis} Try: ${step.remediations.join("; ")}.`;
}

export function exhaustedRecommendation(classification: IssueClassification): string {
  return `These ${classification.category.toLowerCase()} checks did not resolve it. Creating a ticket will get a support specialist on it, with the full diagnostic log attached.`;
}

export function escalatedRecommendation(classification: IssueClassification): string {
  return `This ticket is with Level 2 as urgent ${classification.category.toLowerCase()} work.`;
}
