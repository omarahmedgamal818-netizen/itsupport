import { toSessionSteps, type PlaybookStep, type SessionStep } from "./playbook-types";

const VPN_PATTERN = /\bvpn\b|virtual private|anyconnect|globalprotect|forticlient/i;
const ACCESS_PATTERN =
  /password|locked out|lockout|mfa|2fa|authenticator|forgot (my )?password|can'?t log ?in|cannot log ?in|sign[- ]?in|account (is )?locked|reset (my )?password/i;
const EMAIL_PATTERN = /\boutlook\b|\bmailbox\b|\bexchange\b|office 365|o365|\bemail\b|\be-mail\b/i;
const PRINTER_PATTERN = /\bprint(er|ing|s|ed)?\b|spooler|toner|paper jam/i;

export function isVpnIssue(issue: string): boolean {
  return VPN_PATTERN.test(issue);
}

export function isAccessIssue(issue: string): boolean {
  return ACCESS_PATTERN.test(issue);
}

export function isEmailIssue(issue: string): boolean {
  return EMAIL_PATTERN.test(issue);
}

export function isPrinterIssue(issue: string): boolean {
  return PRINTER_PATTERN.test(issue);
}

function withHandoff(steps: PlaybookStep[], category: string): SessionStep[] {
  return toSessionSteps([
    ...steps,
    {
      id: "create-ticket",
      label: "Create IT ticket",
      detail: `The remaining path needs a person. Create a ticket so Support gets this ${category.toLowerCase()} diagnostic log.`,
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs an IT ticket.",
    },
    {
      id: "escalate-l2",
      label: "Escalate to Level 2",
      detail: `If first-line Support cannot finish this, escalate to Level 2 as ${category.toLowerCase()} work.`,
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs Level 2.",
    },
  ]);
}

export function makeVpnPlaybookSteps(): SessionStep[] {
  return withHandoff(
    [
      {
        id: "vpn-internet",
        label: "Check internet first",
        detail: "Open a public website. If the whole internet is down, this is not a VPN problem yet.",
        kind: "check",
        remediations: ["Reconnect to Wi-Fi or Ethernet", "Try a phone hotspot"],
        failDiagnosis: "The device has no internet, so the VPN client cannot connect.",
      },
      {
        id: "vpn-client",
        label: "Check the VPN client",
        detail: "Confirm the company VPN app is installed, signed in, and showing a gateway.",
        kind: "check",
        remediations: ["Install the approved VPN client from Company Portal", "Sign in with your work account"],
        failDiagnosis: "The VPN client is missing, signed out, or pointing at the wrong gateway.",
      },
      {
        id: "vpn-credentials",
        label: "Check credentials and MFA",
        detail: "Try connecting once and watch for a password prompt or authenticator push.",
        kind: "check",
        remediations: ["Reset the VPN password if it was changed recently", "Approve the MFA prompt on your phone"],
        failDiagnosis: "The VPN is rejecting the account or MFA is not completing.",
      },
      {
        id: "vpn-reconnect",
        label: "Disconnect and reconnect",
        detail: "Disconnect fully, wait ten seconds, then connect again to the usual gateway.",
        kind: "action",
        remediations: [],
        failDiagnosis: "A fresh connect did not restore the VPN session.",
      },
      {
        id: "vpn-network",
        label: "Try another network",
        detail: "Switch from Wi-Fi to a docked Ethernet adapter, or try a phone hotspot. Some home routers block VPN ports.",
        kind: "check",
        remediations: ["Move to Ethernet or a hotspot", "Disable IPv6 on the adapter as a test"],
        failDiagnosis: "The current network appears to block or drop the VPN.",
      },
      {
        id: "vpn-restart-service",
        label: "Restart the VPN service",
        detail: "Quit the client completely from the tray, then open it again. Avoid just closing the window.",
        kind: "action",
        remediations: [],
        failDiagnosis: "Restarting the VPN client did not restore the session.",
      },
      {
        id: "vpn-retest",
        label: "Re-test the VPN",
        detail: "Connect and open an internal site or file share. Tell me if the tunnel stays up.",
        kind: "check",
        remediations: [],
        failDiagnosis: "The VPN is still dropping or blocking internal resources.",
      },
    ],
    "Network access",
  );
}

export function makeAccessPlaybookSteps(): SessionStep[] {
  return withHandoff(
    [
      {
        id: "access-symptom",
        label: "Confirm locked vs forgotten",
        detail: "Is the password rejected, or does the account say it is locked? Those two paths are different.",
        kind: "check",
        remediations: ["Note the exact error on the sign-in page"],
        failDiagnosis: "The sign-in error is still blocking access.",
      },
      {
        id: "access-caps",
        label: "Check keyboard and Caps Lock",
        detail: "Confirm Caps Lock is off and you are on the expected keyboard layout.",
        kind: "check",
        remediations: ["Turn Caps Lock off", "Try the password in a notes app to see the characters"],
        failDiagnosis: "Keyboard layout or Caps Lock is likely changing the password you type.",
      },
      {
        id: "access-self-reset",
        label: "Try self-service password reset",
        detail: "On the company sign-in page choose Forgot password and use your work email.",
        kind: "action",
        remediations: ["Check spam if the reset email never arrives"],
        failDiagnosis: "Self-service reset did not complete.",
      },
      {
        id: "access-mfa",
        label: "Check MFA device",
        detail: "Open the authenticator app and confirm you can approve a sign-in. A new phone often breaks MFA.",
        kind: "check",
        remediations: ["Use a backup method if one is enrolled", "Ask Support to reset MFA if the phone is gone"],
        failDiagnosis: "MFA is not completing on the enrolled device.",
      },
      {
        id: "access-other-device",
        label: "Try another browser or device",
        detail: "Sign in from a private window or your phone. That tells us whether the account or this laptop is the problem.",
        kind: "check",
        remediations: ["Clear the cached work account on this browser"],
        failDiagnosis: "Sign-in still fails on another device, so the account itself is blocked.",
      },
      {
        id: "access-retest",
        label: "Re-test sign-in",
        detail: "Try the work account once more. If it works, you can close this without a ticket.",
        kind: "check",
        remediations: [],
        failDiagnosis: "The account is still unable to sign in after these checks.",
      },
    ],
    "Access",
  );
}

export function makeEmailPlaybookSteps(): SessionStep[] {
  return withHandoff(
    [
      {
        id: "email-internet",
        label: "Check internet and VPN",
        detail: "Outlook needs a working network. If you are off-site, confirm VPN if internal mail requires it.",
        kind: "check",
        remediations: ["Reconnect to the network", "Connect VPN if you are away from the office"],
        failDiagnosis: "There is no usable network for mail.",
      },
      {
        id: "email-quota",
        label: "Check mailbox quota",
        detail: "Open Outlook or OWA and see whether the mailbox is full. A full mailbox blocks send and sometimes receive.",
        kind: "check",
        remediations: ["Empty Deleted Items", "Archive old mail to a PST or online archive"],
        failDiagnosis: "The mailbox is over quota.",
      },
      {
        id: "email-restart",
        label: "Restart Outlook",
        detail: "Fully quit Outlook from the tray, then open it again and wait for the status bar to say Connected.",
        kind: "action",
        remediations: [],
        failDiagnosis: "Restarting Outlook did not restore mail.",
      },
      {
        id: "email-owa",
        label: "Compare with web mail",
        detail: "Open Outlook on the web. If web mail works, the problem is the desktop profile, not the mailbox.",
        kind: "check",
        remediations: ["Work in OWA until the desktop client is repaired"],
        failDiagnosis: "Mail is failing in both the desktop client and the browser.",
      },
      {
        id: "email-repair",
        label: "Repair the Outlook profile",
        detail: "In Account settings, repair the work account, or create a new Outlook profile if repair does nothing.",
        kind: "action",
        remediations: [],
        failDiagnosis: "Repairing the profile did not restore mail.",
      },
      {
        id: "email-retest",
        label: "Re-test send and receive",
        detail: "Send a test message to yourself. Tell me if it arrives and whether new mail is flowing.",
        kind: "check",
        remediations: [],
        failDiagnosis: "Send or receive is still failing after these checks.",
      },
    ],
    "Email",
  );
}

export function makePrinterPlaybookSteps(): SessionStep[] {
  return withHandoff(
    [
      {
        id: "printer-ready",
        label: "Check the printer itself",
        detail: "Confirm power, paper, toner, and that no error lights or paper jam messages are showing.",
        kind: "check",
        remediations: ["Clear a jam", "Load paper", "Replace toner if the printer says so"],
        failDiagnosis: "The printer is in an error state at the device.",
      },
      {
        id: "printer-selected",
        label: "Check the selected printer",
        detail: "In the print dialog, confirm the intended printer is selected — not Microsoft Print to PDF or an old queue.",
        kind: "check",
        remediations: ["Pick the correct printer", "Set it as the default if you use it every day"],
        failDiagnosis: "Jobs are going to the wrong printer or a virtual queue.",
      },
      {
        id: "printer-queue",
        label: "Check the print queue",
        detail: "Open the queue and look for stuck jobs. One paused or error job blocks everything behind it.",
        kind: "check",
        remediations: ["Cancel stuck jobs", "Resume the queue if it is paused"],
        failDiagnosis: "The print queue is stuck.",
      },
      {
        id: "printer-spooler",
        label: "Restart the Print Spooler",
        detail: "Restart the Print Spooler service, then try a test page. This clears a hung Windows print pipeline.",
        kind: "action",
        remediations: [],
        failDiagnosis: "Restarting the spooler did not release the queue.",
      },
      {
        id: "printer-connection",
        label: "Check USB or network",
        detail: "For USB, reseat the cable. For network printers, ping the printer address or reprint from another PC.",
        kind: "check",
        remediations: ["Reconnect USB", "Reconnect to the printer on the network", "Try from another computer"],
        failDiagnosis: "The laptop cannot reach the printer.",
      },
      {
        id: "printer-retest",
        label: "Print a test page",
        detail: "Send a Windows test page or a one-page document. Tell me if it comes out cleanly.",
        kind: "check",
        remediations: [],
        failDiagnosis: "Printing still fails after these checks.",
      },
    ],
    "Printer",
  );
}
