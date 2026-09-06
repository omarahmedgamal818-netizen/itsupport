import type { Ticket, TicketInput, TicketUpdate } from "@workspace/api-zod";

export type UserRole = "employee" | "support";

export type WorkspaceUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  initials: string;
};

export type KnowledgeArticle = {
  id: number;
  title: string;
  category: string;
  summary: string;
  body: string;
  updatedAt: Date;
};

export type TicketComment = {
  id: number;
  ticketId: number;
  author: string;
  body: string;
  createdAt: Date;
};

export type ActivityEvent = {
  id: number;
  ticketId: number;
  actor: string;
  action: string;
  detail: string;
  createdAt: Date;
};

export type TicketAttachment = {
  id: number;
  ticketId: number;
  filename: string;
  contentType: string;
  size: number;
  data: string;
  createdAt: Date;
};

export type WorkspaceNotification = {
  id: number;
  user: string;
  title: string;
  body: string;
  ticketId: number | null;
  read: boolean;
  createdAt: Date;
};

export const demoUsers: WorkspaceUser[] = [
  {
    id: 1,
    name: "Eng. Omar Ahmed Gamal",
    email: "omar.ahmed@company.com",
    role: "employee",
    department: "Product operations",
    initials: "OA",
  },
  {
    id: 2,
    name: "Eng. Omar Gamal",
    email: "omar.gamal@company.com",
    role: "support",
    department: "IT Support",
    initials: "OG",
  },
  {
    id: 3,
    name: "Alex Morgan",
    email: "alex.morgan@company.com",
    role: "employee",
    department: "Product",
    initials: "AM",
  },
];

// Notifications are addressed by display name, so the support inbox is the
// name of the first support account rather than a hardcoded string.
const supportLead =
  demoUsers.find((user) => user.role === "support")?.name ?? "IT Support";

const articles: KnowledgeArticle[] = [
  {
    id: 1,
    title: "Wi-Fi connected but websites do not load",
    category: "Connectivity",
    summary: "Walk through IP, gateway, DNS, and VPN checks when the network icon looks fine.",
    body: "1. Confirm you are connected to the expected SSID.\n2. Check for a 169.254.x.x address and renew DHCP if you see one.\n3. Ping the default gateway.\n4. Flush DNS and try 1.1.1.1 as an alternate resolver.\n5. Disconnect VPN or proxy and retry.\n6. If other devices fail too, treat it as infrastructure and open a ticket.",
    updatedAt: new Date("2026-08-20T09:00:00Z"),
  },
  {
    id: 2,
    title: "Reset your password from the office sign-in page",
    category: "Access",
    summary: "Self-service password reset without waiting on the service desk.",
    body: "Open the company sign-in page, choose Forgot password, and use your work email. Approval is automatic if MFA is already enrolled. If reset email never arrives, check spam and then create an Access ticket.",
    updatedAt: new Date("2026-08-12T14:00:00Z"),
  },
  {
    id: 3,
    title: "VPN drops every few minutes",
    category: "Network access",
    summary: "Stable VPN checklist for home and office networks.",
    body: "Update the VPN client, switch from Wi-Fi to a docked Ethernet adapter if you can, and disable split-tunnel experiments. If the session still drops around the 10-minute mark, capture the client log and attach it to a ticket.",
    updatedAt: new Date("2026-08-18T11:30:00Z"),
  },
  {
    id: 4,
    title: "Request a loaner laptop",
    category: "Hardware",
    summary: "How People and IT coordinate a replacement device.",
    body: "Ask your manager to approve a loaner in the hardware catalog. Bring the broken device to IT if it still powers on. New starter setups should use the Hardware ticket type so accounts and standard apps are included.",
    updatedAt: new Date("2026-07-30T08:15:00Z"),
  },
  {
    id: 5,
    title: "Install approved software",
    category: "Software",
    summary: "Company catalog first, then a Software ticket if the app is missing.",
    body: "Search Company Portal / Self Service before asking Support. If the title is not listed, open a Software ticket with the vendor, version, and business reason. Do not install unsigned packages.",
    updatedAt: new Date("2026-08-05T16:45:00Z"),
  },
  {
    id: 6,
    title: "Outlook stuck in Outbox",
    category: "Email",
    summary: "Send/receive checklist when desktop Outlook looks frozen.",
    body: "1. Confirm the network and VPN if you are off-site.\n2. Check mailbox quota in OWA.\n3. Fully quit Outlook and reopen it.\n4. If web mail works, repair the desktop profile.\n5. Empty Deleted Items before opening a ticket.",
    updatedAt: new Date("2026-08-22T10:00:00Z"),
  },
  {
    id: 7,
    title: "Printer queue will not release jobs",
    category: "Printer",
    summary: "Clear a stuck Windows print queue without reimaging the laptop.",
    body: "1. Confirm the physical printer is ready.\n2. Check you selected the real printer, not Print to PDF.\n3. Cancel error jobs.\n4. Restart the Print Spooler service.\n5. Print a Windows test page. If another PC prints, treat it as this laptop’s driver.",
    updatedAt: new Date("2026-08-21T13:20:00Z"),
  },
];

const tickets: Ticket[] = [];
const comments: TicketComment[] = [];
const activity: ActivityEvent[] = [];
const attachments: TicketAttachment[] = [];
const notifications: WorkspaceNotification[] = [];

let nextTicketId = 1;
let nextCommentId = 1;
let nextActivityId = 1;
let nextAttachmentId = 1;
let nextNotificationId = 1;
let ticketsSeeded = false;

export function findUserByEmail(email: string): WorkspaceUser | undefined {
  const normalized = email.trim().toLowerCase();
  return demoUsers.find((user) => user.email === normalized);
}

function searchable(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "");
}

export function listArticles(query?: string): KnowledgeArticle[] {
  const needle = query?.trim().toLowerCase();
  if (!needle) return [...articles];
  const compactNeedle = searchable(needle);
  return articles.filter((article) =>
    [article.title, article.category, article.summary, article.body].some((value) => {
      const text = value.toLowerCase();
      return text.includes(needle) || searchable(value).includes(compactNeedle);
    }),
  );
}

export function listTicketsFromStore(): Ticket[] {
  return [...tickets].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function insertTicketToStore(data: TicketInput): Ticket {
  const now = new Date();
  const ticket: Ticket = {
    id: nextTicketId++,
    ...data,
    assignee: data.assignee ?? null,
    createdAt: now,
    updatedAt: now,
  };
  tickets.push(ticket);
  addActivity(ticket.id, data.requester, "created", `Ticket opened in ${ticket.category}.`);
  notifySupport("New ticket in the queue", `${ticket.requester}: ${ticket.title}`, ticket.id);
  return ticket;
}

export function updateTicketInStore(id: number, data: TicketUpdate, actor = "Support"): Ticket | undefined {
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index === -1) return undefined;
  const current = tickets[index];
  const updated: Ticket = {
    ...current,
    ...data,
    assignee: data.assignee === undefined ? current.assignee : data.assignee,
    updatedAt: new Date(),
  };
  tickets[index] = updated;

  if (data.status && data.status !== current.status) {
    addActivity(id, actor, "status", `Status changed to ${data.status.replaceAll("_", " ")}.`);
  }
  if (data.priority && data.priority !== current.priority) {
    addActivity(id, actor, "priority", `Priority set to ${data.priority}.`);
  }
  if (data.assignee !== undefined && data.assignee !== current.assignee) {
    addActivity(id, actor, "assignment", data.assignee ? `Assigned to ${data.assignee}.` : "Ticket unassigned.");
  }
  notifyUser(updated.requester, "Your ticket was updated", `${updated.title} has a new update.`, updated.id);
  if (updated.assignee && updated.assignee !== actor) {
    notifyUser(updated.assignee, "Ticket assigned to you", updated.title, updated.id);
  }
  return updated;
}

export function seedTicketsIfNeeded(seeds: TicketInput[]): void {
  if (ticketsSeeded || tickets.length > 0) return;
  ticketsSeeded = true;
  for (const seed of seeds) {
    insertTicketToStore(seed);
  }
}

export function addComment(ticketId: number, author: string, body: string): TicketComment {
  const comment: TicketComment = {
    id: nextCommentId++,
    ticketId,
    author,
    body,
    createdAt: new Date(),
  };
  comments.push(comment);
  addActivity(ticketId, author, "comment", body);
  const ticket = tickets.find((item) => item.id === ticketId);
  if (ticket) {
    const audience = author === ticket.requester ? ticket.assignee ?? supportLead : ticket.requester;
    notifyUser(audience, `New comment on #${ticket.id}`, `${author}: ${body}`, ticketId);
  }
  return comment;
}

export function listComments(ticketId: number): TicketComment[] {
  return comments
    .filter((comment) => comment.ticketId === ticketId)
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
}

export function addActivity(ticketId: number, actor: string, action: string, detail: string): ActivityEvent {
  const event: ActivityEvent = {
    id: nextActivityId++,
    ticketId,
    actor,
    action,
    detail,
    createdAt: new Date(),
  };
  activity.push(event);
  return event;
}

export function listActivity(ticketId: number): ActivityEvent[] {
  return activity
    .filter((event) => event.ticketId === ticketId)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function addAttachment(
  ticketId: number,
  input: { filename: string; contentType: string; data: string; author: string },
): TicketAttachment {
  const attachment: TicketAttachment = {
    id: nextAttachmentId++,
    ticketId,
    filename: input.filename,
    contentType: input.contentType,
    size: Math.round((input.data.length * 3) / 4),
    data: input.data,
    createdAt: new Date(),
  };
  attachments.push(attachment);
  addActivity(ticketId, input.author, "attachment", `Attached ${input.filename}.`);
  const ticket = tickets.find((item) => item.id === ticketId);
  if (ticket) {
    notifyUser(ticket.assignee ?? supportLead, "Attachment added", `${input.filename} on ${ticket.title}`, ticketId);
  }
  return attachment;
}

export function listAttachments(ticketId: number): Omit<TicketAttachment, "data">[] {
  return attachments
    .filter((attachment) => attachment.ticketId === ticketId)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map(({ data: _data, ...rest }) => rest);
}

export function getAttachment(ticketId: number, attachmentId: number): TicketAttachment | undefined {
  return attachments.find((attachment) => attachment.ticketId === ticketId && attachment.id === attachmentId);
}

export function notifyUser(user: string, title: string, body: string, ticketId: number | null): void {
  notifications.push({
    id: nextNotificationId++,
    user,
    title,
    body,
    ticketId,
    read: false,
    createdAt: new Date(),
  });
}

function notifySupport(title: string, body: string, ticketId: number): void {
  notifyUser(supportLead, title, body, ticketId);
}

export function listNotifications(user: string): WorkspaceNotification[] {
  return notifications
    .filter((notification) => notification.user.toLowerCase() === user.trim().toLowerCase())
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function markNotificationRead(id: number): WorkspaceNotification | undefined {
  const notification = notifications.find((item) => item.id === id);
  if (!notification) return undefined;
  notification.read = true;
  return notification;
}

export function buildOverview(ticketList: Ticket[]) {
  const openTickets = ticketList.filter((ticket) => ticket.status === "open").length;
  const inProgressTickets = ticketList.filter((ticket) => ticket.status === "in_progress").length;
  const resolvedToday = ticketList.filter((ticket) => ticket.status === "resolved").length;
  const slaAtRisk = ticketList.filter((ticket) => ticket.priority === "urgent" || ticket.priority === "high").length;

  const categoryMap = new Map<string, number>();
  const priorityMap = new Map<string, number>();
  for (const ticket of ticketList) {
    categoryMap.set(ticket.category, (categoryMap.get(ticket.category) ?? 0) + 1);
    priorityMap.set(ticket.priority, (priorityMap.get(ticket.priority) ?? 0) + 1);
  }

  const trend = [
    { day: "Mon", opened: Math.max(1, openTickets), resolved: Math.max(0, resolvedToday) },
    { day: "Tue", opened: openTickets + 1, resolved: resolvedToday + 1 },
    { day: "Wed", opened: inProgressTickets + 1, resolved: resolvedToday },
    { day: "Thu", opened: openTickets, resolved: resolvedToday + 2 },
    { day: "Fri", opened: Math.max(openTickets - 1, 0), resolved: resolvedToday + 1 },
  ];

  return {
    openTickets,
    inProgressTickets,
    resolvedToday,
    avgResponse: "18 min",
    slaAtRisk,
    recentTickets: ticketList.slice(0, 4),
    categories: [...categoryMap.entries()].map(([name, count]) => ({ name, count })),
    priorities: [...priorityMap.entries()].map(([name, count]) => ({ name, count })),
    trend,
  };
}
