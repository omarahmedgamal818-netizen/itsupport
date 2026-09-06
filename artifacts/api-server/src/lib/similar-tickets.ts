import type { Ticket } from "@workspace/api-zod";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "be", "but", "can", "cant", "cannot", "do", "does", "dont",
  "for", "from", "i", "in", "is", "it", "my", "not", "of", "on", "or", "the", "this",
  "to", "very", "was", "with", "am", "me", "we", "our", "will", "wont", "would", "could",
  "every", "after", "have", "has", "been", "just", "still", "please", "help", "issue",
  "problem", "need", "gets", "get",
]);

export type SimilarTicketMatch = {
  ticket: Ticket;
  score: number;
  solution: string;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function solutionFromTicket(ticket: Ticket): string {
  const marked = ticket.description.match(/Resolution:\s*([\s\S]+)/i);
  if (marked?.[1]) return marked[1].trim();
  const first = ticket.description.split("\n").find((line) => line.trim().length > 0);
  return (first ?? ticket.description).trim().slice(0, 280);
}

export function findSimilarTickets(tickets: Ticket[], query: string, limit = 5): SimilarTicketMatch[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored = tickets
    .map((ticket) => {
      const title = tokenize(ticket.title);
      const category = tokenize(ticket.category);
      const description = tokenize(ticket.description);
      let score = 0;
      let coreHits = 0;
      for (const token of tokens) {
        if (title.includes(token)) {
          score += 4;
          coreHits += 1;
        }
        if (category.includes(token)) {
          score += 3;
          coreHits += 1;
        }
        if (description.includes(token)) score += 1;
      }
      if (ticket.status === "resolved") score += 2;
      return { ticket, score, coreHits, solution: solutionFromTicket(ticket) };
    })
    .filter((item) => item.coreHits > 0 && item.score >= 4)
    .sort((left, right) => {
      const byScore = right.score - left.score;
      if (byScore !== 0) return byScore;
      return new Date(right.ticket.updatedAt).getTime() - new Date(left.ticket.updatedAt).getTime();
    });

  return scored.slice(0, limit);
}
