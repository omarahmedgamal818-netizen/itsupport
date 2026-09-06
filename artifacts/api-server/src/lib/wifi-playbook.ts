import { toSessionSteps, type PlaybookStep, type SessionStep } from "./playbook-types";

export type { PlaybookStep, SessionStep, StepKind } from "./playbook-types";

const CONNECTIVITY_PATTERN =
  /wifi|wi-fi|wi fi|website|internet|dns|browser|gateway|connect|network|ping|offline|web site/i;

export function isConnectivityIssue(issue: string): boolean {
  return CONNECTIVITY_PATTERN.test(issue);
}

export function makeWifiPlaybookSteps(): SessionStep[] {
  const steps: PlaybookStep[] = [
    {
      id: "wifi-connection",
      label: "Check Wi-Fi connection",
      detail:
        "Confirm the laptop is actually connected to the expected Wi-Fi network, not just that Wi-Fi is turned on.",
      kind: "check",
      remediations: [
        "Enable Wi-Fi",
        "Forget the network and reconnect",
        "Check the Wi-Fi password",
      ],
      failDiagnosis: "The device is not connected to Wi-Fi.",
    },
    {
      id: "ip-config",
      label: "Check IP configuration",
      detail:
        "Open the adapter details and check the IPv4 address. An address starting with 169.254 means DHCP did not assign an address.",
      kind: "check",
      remediations: [
        "Renew the DHCP lease",
        "Disable then enable the network adapter",
        "Restart DHCP-related services",
      ],
      failDiagnosis: "The adapter has a 169.254.x.x address, so DHCP did not assign a valid IP.",
    },
    {
      id: "default-gateway",
      label: "Check default gateway",
      detail:
        "Find the default gateway in the adapter details and confirm it looks like your router or access point.",
      kind: "check",
      remediations: [
        "Check the router or access point connection",
        "Check the network adapter",
        "Reconnect to Wi-Fi",
        "Test another network",
      ],
      failDiagnosis: "The default gateway is missing or unreachable.",
    },
    {
      id: "ping-gateway",
      label: "Ping gateway",
      detail:
        "Ping the default gateway. A failed ping usually means a local network problem between this device and the router.",
      kind: "check",
      remediations: ["Treat this as a local network problem and continue the remaining checks"],
      failDiagnosis: "The gateway ping failed. This is a local network problem.",
    },
    {
      id: "dns-config",
      label: "Check DNS configuration",
      detail:
        "Confirm a DNS server is listed on the adapter. If DNS is blank or unavailable, name lookups will fail even if the network is up.",
      kind: "check",
      remediations: [
        "Flush the DNS cache",
        "Renew the IP address",
        "Check the configured DNS server",
        "Test an alternative DNS server",
      ],
      failDiagnosis: "DNS is unavailable or not configured on this adapter.",
    },
    {
      id: "dns-resolution",
      label: "Test DNS resolution",
      detail:
        "Try resolving a known domain (for example, ping a hostname). If the name does not resolve, this is a DNS problem.",
      kind: "check",
      remediations: ["Treat this as a DNS problem and continue to connectivity checks"],
      failDiagnosis: "The device cannot resolve domain names. This is a DNS problem.",
    },
    {
      id: "external-connectivity",
      label: "Test external connectivity",
      detail:
        "Try reaching a public address or a known-good internet site. Failure here often means an ISP, firewall, or routing issue.",
      kind: "check",
      remediations: ["Treat this as an ISP, firewall, or routing issue"],
      failDiagnosis: "The internet is unreachable. This is likely an ISP, firewall, or routing issue.",
    },
    {
      id: "test-website",
      label: "Test website",
      detail:
        "Try more than one website. If only one site fails, the problem is likely that website. If many sites fail, keep going.",
      kind: "check",
      remediations: ["If only one website fails, treat it as a website-specific issue"],
      failDiagnosis: "Website access is still failing.",
    },
    {
      id: "proxy-vpn",
      label: "Check proxy/VPN",
      detail:
        "Look for a proxy, VPN, or corporate security client that could intercept or block web traffic.",
      kind: "check",
      remediations: [
        "Check whether a proxy is enabled",
        "Check whether a VPN is connected",
        "Check corporate security software",
      ],
      failDiagnosis: "A proxy, VPN, or security client may be blocking websites.",
    },
    {
      id: "firewall",
      label: "Check firewall",
      detail:
        "Verify Windows Firewall and any extra security software are not blocking browser or network traffic.",
      kind: "check",
      remediations: [
        "Verify Windows Firewall rules",
        "Check security software",
        "Check for blocked traffic",
      ],
      failDiagnosis: "A firewall or security tool may be blocking traffic.",
    },
    {
      id: "restart-adapter",
      label: "Restart network adapter",
      detail:
        "Disable the Wi-Fi adapter, wait a few seconds, then enable it again and reconnect to the network.",
      kind: "action",
      remediations: [],
      failDiagnosis: "Restarting the adapter did not restore website access.",
    },
    {
      id: "restart-computer",
      label: "Restart computer",
      detail:
        "Save your work and restart the laptop, then try the websites again after sign-in.",
      kind: "action",
      remediations: [],
      failDiagnosis: "A full restart did not restore website access.",
    },
    {
      id: "other-device",
      label: "Test another device",
      detail:
        "Try the same websites on a phone or another laptop on this Wi-Fi. That tells us whether the network or this endpoint is at fault.",
      kind: "check",
      remediations: [],
      failDiagnosis: "Website access is still failing after comparing another device.",
    },
    {
      id: "create-ticket",
      label: "Create IT ticket",
      detail:
        "The remaining path needs a person. Create a ticket so Support gets this diagnostic log.",
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs an IT ticket.",
    },
    {
      id: "escalate-l2",
      label: "Escalate to Level 2",
      detail:
        "If first-line Support cannot finish this, escalate the ticket to Level 2 as an urgent connectivity issue.",
      kind: "handoff",
      remediations: [],
      failDiagnosis: "This issue needs Level 2.",
    },
  ];

  return toSessionSteps(steps);
}

export function makeGenericPlaybookSteps(): SessionStep[] {
  const steps: PlaybookStep[] = [
    {
      id: "ip-config",
      label: "Check IP configuration",
      detail: "Looking for a valid local address and network adapter state.",
      kind: "check",
      remediations: ["Renew the IP address", "Disable then enable the network adapter"],
      failDiagnosis: "The device does not have a valid IP configuration.",
    },
    {
      id: "gateway",
      label: "Test gateway",
      detail: "Checking whether your device can reach the local router.",
      kind: "check",
      remediations: ["Reconnect to the network", "Try another network"],
      failDiagnosis: "The default gateway is unreachable.",
    },
    {
      id: "dns",
      label: "Test DNS",
      detail: "Verifying that domain names resolve correctly.",
      kind: "check",
      remediations: ["Flush the DNS cache", "Try an alternative DNS server"],
      failDiagnosis: "DNS resolution is failing.",
    },
    {
      id: "external",
      label: "Test external connectivity",
      detail: "Checking a secure connection to the public internet.",
      kind: "check",
      remediations: ["Check VPN, proxy, and firewall settings"],
      failDiagnosis: "External connectivity is still unavailable.",
    },
  ];

  return toSessionSteps(steps);
}

export function diagnosisForFinding(stepId: string, finding: string | null | undefined): string | undefined {
  if (stepId === "test-website" && finding === "one_site") {
    return "Only one website is failing. This is likely a website-specific issue, not your whole connection.";
  }
  if (stepId === "test-website" && finding === "all_sites") {
    return "Multiple websites are failing. Keep going to proxy, VPN, and firewall checks.";
  }
  if (stepId === "other-device" && finding === "other_devices") {
    return "Other devices also fail. This looks like a network infrastructure issue.";
  }
  if (stepId === "other-device" && finding === "this_device") {
    return "Only this laptop fails. This looks like an endpoint issue.";
  }
  return undefined;
}

