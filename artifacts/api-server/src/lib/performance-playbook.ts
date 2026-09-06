import { toSessionSteps, type PlaybookStep, type SessionStep } from "./playbook-types";

const PERFORMANCE_PATTERN =
  /slow|sluggish|lag|laggy|freez|frozen|hang|hangs|unresponsive|not responding|performance|taking forever|takes ages|spinning|stutter|overheat|hot|fan|throttl|high cpu|100% cpu|out of memory|crawl/i;

export function isPerformanceIssue(issue: string): boolean {
  return PERFORMANCE_PATTERN.test(issue);
}

export function makePerformancePlaybookSteps(): SessionStep[] {
  const steps: PlaybookStep[] = [
    {
      id: "cpu-usage",
      label: "Check CPU usage",
      detail:
        "Open Task Manager and look at the Performance tab. Sustained CPU above about 80% with one process on top usually explains the slowness.",
      kind: "check",
      remediations: [
        "End the runaway process if it is safe to close",
        "Note the process name so Support can see the pattern",
        "Check for a stuck update, indexer, or build task",
      ],
      failDiagnosis: "CPU is pinned by one or more processes.",
    },
    {
      id: "ram-usage",
      label: "Check RAM usage",
      detail:
        "In Task Manager, compare memory in use against total memory. If almost nothing is available, Windows starts swapping to disk and everything feels slow.",
      kind: "check",
      remediations: [
        "Close unused browser tabs and applications",
        "Sign out and back in to clear leaked memory",
        "Note any single app holding several gigabytes",
      ],
      failDiagnosis: "Memory is exhausted, so the system is swapping to disk.",
    },
    {
      id: "disk-usage",
      label: "Check Disk usage",
      detail:
        "Look at the Disk column in Task Manager. Active time stuck at 100% means the drive is the bottleneck, not the CPU.",
      kind: "check",
      remediations: [
        "Identify which process is driving the disk",
        "Pause cloud sync or backup software temporarily",
        "Let search indexing finish before judging speed",
      ],
      failDiagnosis: "Disk activity is saturated at or near 100%.",
    },
    {
      id: "available-storage",
      label: "Check available storage",
      detail:
        "Check free space on the system drive. Below roughly 10% free, Windows has no room to page or update and slows down noticeably.",
      kind: "check",
      remediations: [
        "Run Storage Sense or Disk Cleanup",
        "Empty the Recycle Bin and clear the Downloads folder",
        "Move large files to OneDrive or a network share",
      ],
      failDiagnosis: "The system drive is nearly full.",
    },
    {
      id: "startup-apps",
      label: "Check startup applications",
      detail:
        "Open the Startup apps tab in Task Manager and look at the impact column. A long list of high-impact apps makes every sign-in slow.",
      kind: "check",
      remediations: [
        "Disable high-impact apps you do not need at sign-in",
        "Leave security and management agents enabled",
      ],
      failDiagnosis: "Too many high-impact applications launch at sign-in.",
    },
    {
      id: "running-processes",
      label: "Check running processes",
      detail:
        "Sort processes by CPU and then by memory. Look for duplicates of the same app, or anything you do not recognise.",
      kind: "check",
      remediations: [
        "Close duplicate instances of the same application",
        "End processes that are not responding",
        "Write down anything unfamiliar for Support to review",
      ],
      failDiagnosis: "Unexpected processes are consuming resources.",
    },
    {
      id: "windows-update",
      label: "Check Windows Update",
      detail:
        "Open Windows Update. An update that is downloading, installing, or stuck in a retry loop will use the disk and CPU heavily in the background.",
      kind: "check",
      remediations: [
        "Let an in-progress update finish, then restart",
        "Install pending updates during a break",
        "Report a repeatedly failing update to Support",
      ],
      failDiagnosis: "Windows Update is pending, installing, or stuck retrying.",
    },
    {
      id: "background-apps",
      label: "Check background applications",
      detail:
        "Check the system tray and background apps. Chat clients, meeting apps, and media players often keep working after you think you closed them.",
      kind: "check",
      remediations: [
        "Quit tray apps you are not actively using",
        "Turn off unnecessary background app permissions",
      ],
      failDiagnosis: "Background applications are consuming resources.",
    },
    {
      id: "security-scan",
      label: "Check antivirus/security scans",
      detail:
        "Open your security software and check whether a full scan is running. A full scan touches every file and can slow the whole device.",
      kind: "check",
      remediations: [
        "Let the scan finish, or reschedule it outside working hours",
        "Confirm only one antivirus product is installed",
      ],
      failDiagnosis: "A security scan is running and consuming resources.",
    },
    {
      id: "system-temperature",
      label: "Check system temperature",
      detail:
        "Feel whether the chassis is hot and listen for constant fan noise. An overheating laptop deliberately slows itself down to cool off.",
      kind: "check",
      remediations: [
        "Clear the air vents and use a hard, flat surface",
        "Take the laptop out of any bag or closed dock enclosure",
        "Let it cool for a few minutes, then retest",
      ],
      failDiagnosis: "The device is running hot and is likely thermal throttling.",
    },
    {
      id: "disk-health",
      label: "Check disk health",
      detail:
        "Check the drive health or SMART status. A failing drive produces slow reads, long pauses, and eventually data loss.",
      kind: "check",
      remediations: [
        "Back up important files now, before anything else",
        "Run a drive check on the system volume",
        "Tell Support immediately if health status is anything but healthy",
      ],
      failDiagnosis: "The drive is reporting health warnings.",
    },
    {
      id: "sync-status",
      label: "Check network/cloud synchronization",
      detail:
        "Open OneDrive, SharePoint, or any sync client and check its status. A client stuck processing thousands of files will hold the disk and network open.",
      kind: "check",
      remediations: [
        "Pause syncing for an hour and retest",
        "Reduce the number of synced folders",
        "Sign out and back in to the sync client",
      ],
      failDiagnosis: "A cloud sync client is continuously syncing.",
    },
    {
      id: "event-logs",
      label: "Check event logs",
      detail:
        "Open Event Viewer and look at system errors and warnings around the time it felt slow. Repeated entries point at the failing component.",
      kind: "check",
      remediations: [
        "Note the repeated error source and event ID for Support",
      ],
      failDiagnosis: "The event log shows repeated errors around the slowdown.",
    },
    {
      id: "restart-services",
      label: "Restart required services",
      detail:
        "Restart the service behind whatever you found above — for example the print spooler, search indexer, or sync client — instead of rebooting straight away.",
      kind: "action",
      remediations: [],
      failDiagnosis: "Restarting the affected services did not restore performance.",
    },
    {
      id: "restart-computer",
      label: "Restart computer",
      detail:
        "Save your work and do a full restart, not just a lid close. This clears leaked memory and finishes pending updates.",
      kind: "action",
      remediations: [],
      failDiagnosis: "A full restart did not restore performance.",
    },
    {
      id: "retest-performance",
      label: "Re-test performance",
      detail:
        "Open the same apps and files that felt slow and compare. Tell me whether the device is usable again or still slow.",
      kind: "check",
      remediations: [],
      failDiagnosis: "The device is still slow after the full check sequence.",
    },
    {
      id: "create-ticket",
      label: "Create IT ticket",
      detail:
        "The remaining path needs a person. Create a ticket so Support gets this performance diagnostic log.",
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs an IT ticket.",
    },
    {
      id: "escalate-l2",
      label: "Escalate to Level 2",
      detail:
        "If first-line Support cannot finish this, escalate to Level 2 — persistent slowness after these checks usually means hardware or image-level work.",
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs Level 2.",
    },
  ];

  return toSessionSteps(steps);
}
