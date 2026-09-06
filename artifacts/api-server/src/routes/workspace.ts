import { Router, type IRouter } from "express";
import {
  addAttachment,
  addComment,
  demoUsers,
  findUserByEmail,
  getAttachment,
  listActivity,
  listArticles,
  listAttachments,
  listComments,
  listNotifications,
  listTicketsFromStore,
  markNotificationRead,
} from "../lib/workspace-store";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Unknown account. Use one of the demo workplace emails." });
    return;
  }
  res.json(user);
});

router.get("/auth/accounts", (_req, res): void => {
  res.json(demoUsers);
});

router.get("/kb/articles", (req, res): void => {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  res.json(listArticles(query));
});

router.get("/tickets/:id/comments", (req, res): void => {
  const ticketId = Number(req.params.id);
  res.json(listComments(ticketId));
});

router.post("/tickets/:id/comments", (req, res): void => {
  const ticketId = Number(req.params.id);
  const ticket = listTicketsFromStore().find((item) => item.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const author = typeof req.body?.author === "string" ? req.body.author.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
  if (!author || !body) {
    res.status(400).json({ error: "Author and body are required" });
    return;
  }
  res.status(201).json(addComment(ticketId, author, body));
});

router.get("/tickets/:id/activity", (req, res): void => {
  res.json(listActivity(Number(req.params.id)));
});

router.get("/tickets/:id/attachments", (req, res): void => {
  res.json(listAttachments(Number(req.params.id)));
});

router.post("/tickets/:id/attachments", (req, res): void => {
  const ticketId = Number(req.params.id);
  const ticket = listTicketsFromStore().find((item) => item.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const filename = typeof req.body?.filename === "string" ? req.body.filename.trim() : "";
  const contentType = typeof req.body?.contentType === "string" ? req.body.contentType.trim() : "";
  const data = typeof req.body?.data === "string" ? req.body.data : "";
  const author = typeof req.body?.author === "string" ? req.body.author.trim() : "Someone";
  if (!filename || !contentType || !data) {
    res.status(400).json({ error: "filename, contentType, and data are required" });
    return;
  }
  const created = addAttachment(ticketId, { filename, contentType, data, author });
  const { data: _data, ...rest } = created;
  res.status(201).json(rest);
});

router.get("/tickets/:id/attachments/:attachmentId", (req, res): void => {
  const attachment = getAttachment(Number(req.params.id), Number(req.params.attachmentId));
  if (!attachment) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }
  res.json(attachment);
});

router.get("/notifications", (req, res): void => {
  const user = typeof req.query.user === "string" ? req.query.user : "";
  res.json(listNotifications(user));
});

router.post("/notifications/:id/read", (req, res): void => {
  const notification = markNotificationRead(Number(req.params.id));
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

export default router;
