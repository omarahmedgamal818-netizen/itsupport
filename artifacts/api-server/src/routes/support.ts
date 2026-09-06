import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ticketsTable } from "@workspace/db";
import {
  AdvanceTroubleshootingBody,
  AdvanceTroubleshootingParams,
  AdvanceTroubleshootingResponse,
  CreateTicketBody,
  CreateTicketResponse,
  GetSupportOverviewResponse,
  ListTicketsQueryParams,
  ListTicketsResponse,
  ListSimilarTicketsQueryParams,
  ListSimilarTicketsResponse,
  StartTroubleshootingBody,
  StartTroubleshootingResponse,
  type Ticket,
  type TicketInput,
  type TicketUpdate,
  UpdateTicketBody,
  UpdateTicketParams,
  UpdateTicketResponse,
} from "@workspace/api-zod";
import {
  classifyIssue,
  escalatedRecommendation,
  exhaustedRecommendation,
  makePlaybookSteps,
  recommendationForFailure,
  type IssueClassification,
  type SessionStep,
} from "../lib/playbooks";
import {
  addActivity,
  buildOverview,
  insertTicketToStore,
  listTicketsFromStore,
  seedTicketsIfNeeded,
  updateTicketInStore,
} from "../lib/workspace-store";
import { findSimilarTickets } from "../lib/similar-tickets";

const router: IRouter = Router();

type TroubleshootStep = SessionStep;

type TroubleshootSession = {
  id: number;
  issue: string;
  status: "running" | "resolved" | "needs_ticket";
  currentStep: number;
  steps: TroubleshootStep[];
  recommendation: string;
  classification: IssueClassification;
};

const sessions = new Map<number, TroubleshootSession>();
let nextSessionId = 1001;

const seedTickets: TicketInput[] = [
  {
    title: "VPN disconnects every 10 minutes",
    requester: "Eng. Omar Ahmed Gamal",
    department: "Finance",
    status: "in_progress",
    priority: "high",
    category: "Network access",
    description: "VPN session drops repeatedly while working from home.",
    assignee: "Eng. Omar Gamal",
    sla: "Due in 2h 14m",
  },
  {
    title: "Can't access websites over Wi-Fi",
    requester: "Alex Morgan",
    department: "Product",
    status: "open",
    priority: "urgent",
    category: "Connectivity",
    description: "Laptop connects to office Wi-Fi, but every browser request times out.",
    assignee: null,
    sla: "Due in 42m",
  },
  {
    title: "New starter needs laptop setup",
    requester: "Priya Shah",
    department: "People",
    status: "resolved",
    priority: "medium",
    category: "Hardware",
    description: "Prepare laptop, accounts, and standard software for a new starter.",
    assignee: "Eng. Omar Gamal",
    sla: "Resolved",
  },
  {
    title: "Forgot password after a new phone",
    requester: "Alex Morgan",
    department: "Product",
    status: "resolved",
    priority: "high",
    category: "Access",
    description:
      "Could not sign in after replacing a phone.\n\nResolution: Used Forgot password on the company sign-in page, then enrolled the new authenticator. Mail and VPN followed without a reset from Support.",
    assignee: "Eng. Omar Gamal",
    sla: "Resolved",
  },
  {
    title: "Outlook not sending mail",
    requester: "Priya Shah",
    department: "People",
    status: "resolved",
    priority: "medium",
    category: "Email",
    description:
      "Send stayed in Outbox all morning.\n\nResolution: Mailbox was over quota. Emptied Deleted Items and the archive; send and receive resumed in Outlook.",
    assignee: "Eng. Omar Gamal",
    sla: "Resolved",
  },
  {
    title: "Office printer will not print",
    requester: "Alex Morgan",
    department: "Product",
    status: "resolved",
    priority: "medium",
    category: "Printer",
    description:
      "Jobs sat in the queue with no output.\n\nResolution: Cancelled a stuck job, restarted the Print Spooler, and printed a Windows test page.",
    assignee: "Eng. Omar Gamal",
    sla: "Resolved",
  },
  {
    title: "VPN will not connect from home Wi-Fi",
    requester: "Priya Shah",
    department: "People",
    status: "resolved",
    priority: "high",
    category: "Network access",
    description:
      "Client connected then dropped within a minute at home.\n\nResolution: Home router was blocking the VPN. A phone hotspot worked; we documented the ISP workaround in the knowledge base.",
    assignee: "Eng. Omar Gamal",
    sla: "Resolved",
  },
];

async function listStoredTickets(): Promise<Ticket[]> {
  if (!db) {
    seedTicketsIfNeeded(seedTickets);
    return listTicketsFromStore();
  }

  return db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt)) as Promise<Ticket[]>;
}

async function insertStoredTicket(data: TicketInput): Promise<Ticket> {
  if (!db) {
    return insertTicketToStore(data);
  }

  const [ticket] = await db.insert(ticketsTable).values(data).returning();
  addActivity(ticket.id, data.requester, "created", `Ticket opened in ${ticket.category}.`);
  return ticket as Ticket;
}

async function updateStoredTicket(
  id: number,
  data: TicketUpdate,
): Promise<Ticket | undefined> {
  if (!db) {
    return updateTicketInStore(id, data);
  }

  const [ticket] = await db
    .update(ticketsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ticketsTable.id, id))
    .returning();

  if (ticket) {
    addActivity(ticket.id, "Support", "updated", "Ticket fields were updated.");
  }
  return ticket as Ticket | undefined;
}

async function ensureSeeded(): Promise<void> {
  if (!db) {
    seedTicketsIfNeeded(seedTickets);
    return;
  }
  const existing = await db.select({ id: ticketsTable.id }).from(ticketsTable).limit(1);
  if (existing.length === 0) {
    for (const seed of seedTickets) {
      await insertStoredTicket(seed);
    }
  }
}

function recommendationForNext(session: TroubleshootSession): string {
  const next = session.steps[session.currentStep];
  if (!next) {
    return "The remaining path needs a person. Create a ticket so Support gets this diagnostic log.";
  }
  if (next.kind === "handoff") {
    return next.detail;
  }
  return `Next: ${next.label}. ${next.detail}`;
}

function moveToNextStep(session: TroubleshootSession): void {
  const nextIndex = session.currentStep + 1;
  if (nextIndex >= session.steps.length) {
    const last = session.steps[session.currentStep];
    session.status = "needs_ticket";
    session.recommendation =
      last?.id === "escalate-l2"
        ? escalatedRecommendation(session.classification)
        : exhaustedRecommendation(session.classification);
    return;
  }

  session.currentStep = nextIndex;
  const next = session.steps[nextIndex];
  next.status = "running";
  session.recommendation = recommendationForNext(session);
  session.status = next.kind === "handoff" ? "needs_ticket" : "running";
}

function makeSteps(issue: string): TroubleshootStep[] {
  return makePlaybookSteps(issue);
}

router.get("/support/overview", async (_req, res): Promise<void> => {
  await ensureSeeded();
  const tickets = await listStoredTickets();
  res.json(GetSupportOverviewResponse.parse(buildOverview(tickets)));
});

router.post("/troubleshoot/sessions", async (req, res): Promise<void> => {
  const parsed = StartTroubleshootingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const classification = classifyIssue(parsed.data.issue);
  const session: TroubleshootSession = {
    id: nextSessionId++,
    issue: parsed.data.issue,
    status: "running",
    currentStep: 0,
    steps: makeSteps(parsed.data.issue),
    recommendation: `This looks like a ${classification.category.toLowerCase()} issue on a ${classification.device.toLowerCase()}. I’ll walk you through a few safe checks — nothing changes on your device without you doing it.`,
    classification,
  };
  sessions.set(session.id, session);
  res.status(201).json(StartTroubleshootingResponse.parse(session));
});

router.post("/troubleshoot/sessions/:id/advance", async (req, res): Promise<void> => {
  const params = AdvanceTroubleshootingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AdvanceTroubleshootingBody.safeParse(req.body ?? { outcome: "passed" });
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const session = sessions.get(params.data.id);
  if (!session) {
    res.status(404).json({ error: "Troubleshooting session not found" });
    return;
  }

  if (session.status === "resolved") {
    res.json(AdvanceTroubleshootingResponse.parse(session));
    return;
  }

  const current = session.steps[session.currentStep];
  if (!current) {
    res.status(404).json({ error: "Troubleshooting step not found" });
    return;
  }

  const outcome = body.data.outcome;
  const finding = body.data.finding ?? current.finding ?? null;
  if (finding) current.finding = finding;

  if (outcome === "failed") {
    current.status = "failed";
    session.status = "running";
    session.recommendation = recommendationForFailure(current, finding);
    res.json(AdvanceTroubleshootingResponse.parse(session));
    return;
  }

  if (outcome === "fixed") {
    current.status = "passed";
    session.status = "resolved";
    session.recommendation =
      "That path worked. You can stop here — no ticket is needed unless the issue comes back.";
    res.json(AdvanceTroubleshootingResponse.parse(session));
    return;
  }

  if (outcome === "passed") {
    current.status = "passed";
  } else {
    current.status = "failed";
  }

  moveToNextStep(session);
  res.json(AdvanceTroubleshootingResponse.parse(session));
});

router.get("/tickets", async (req, res): Promise<void> => {
  await ensureSeeded();
  const query = ListTicketsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const allTickets = await listStoredTickets();
  const byStatus = query.data.status === "all"
    ? allTickets
    : allTickets.filter((ticket) => ticket.status === query.data.status);
  const requester = query.data.requester?.trim().toLowerCase();
  const tickets = requester
    ? byStatus.filter((ticket) => ticket.requester.toLowerCase() === requester)
    : byStatus;
  res.json(ListTicketsResponse.parse(tickets));
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ticket = await insertStoredTicket(parsed.data);
  res.status(201).json(CreateTicketResponse.parse(ticket));
});

router.get("/tickets/similar", async (req, res): Promise<void> => {
  await ensureSeeded();
  const query = ListSimilarTicketsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const tickets = await listStoredTickets();
  const matches = findSimilarTickets(tickets, query.data.q).map(({ ticket, score, solution }) => ({
    id: ticket.id,
    title: ticket.title,
    requester: ticket.requester,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    sla: ticket.sla,
    score,
    solution,
  }));
  res.json(ListSimilarTicketsResponse.parse(matches));
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ticket = await updateStoredTicket(params.data.id, parsed.data);

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(UpdateTicketResponse.parse(ticket));
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  await ensureSeeded();
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket id" });
    return;
  }
  const tickets = await listStoredTickets();
  const ticket = tickets.find((item) => item.id === id);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

export default router;