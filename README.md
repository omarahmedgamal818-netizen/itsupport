# IT Support AI Assistant

Internal IT helpdesk for employees and the support team.

Employees describe a problem in plain language. The assistant classifies it (category, device, priority), walks a safe playbook, surfaces similar past tickets, and either **closes the ticket** or **creates one** with a diagnostic log — then can escalate to Level 2.

Support works a live queue: assignment, comments, attachments, activity, notifications, knowledge base, and an SLA dashboard.

This is a **deterministic** assistant (classification + playbooks), not a live language model. Nothing is changed on the employee’s device except what they do themselves.

## Features

- Role-based demo sign-in (employee vs support)
- Guided playbooks: Wi-Fi, laptop performance, VPN, password/MFA, Outlook/email, printer (+ short generic fallback)
- Similar-ticket search with reusable resolutions
- Tickets, comments, activity timeline, screenshot/log attachments
- In-app notifications
- Knowledge base / FAQ search
- Support dashboard (SLA at risk, categories, trends)
- Light / dark theme

## Demo accounts

| Email | Role |
|---|---|
| `omar.ahmed@company.com` | Employee |
| `omar.gamal@company.com` | Support |
| `alex.morgan@company.com` | Employee |

## Run locally

```bash
npm run dev
