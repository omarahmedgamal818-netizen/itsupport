import { useMemo, useState } from 'react';
import { BookOpen, Loader2, Search } from 'lucide-react';
import { useListKnowledgeArticles } from '@workspace/api-client-react';

export default function Knowledge() {
  const [query, setQuery] = useState('');
  const articlesQuery = useListKnowledgeArticles({ q: query.trim() || undefined });
  const articles = articlesQuery.data ?? [];
  const categories = useMemo(() => [...new Set(articles.map((article) => article.category))], [articles]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Knowledge base
        </div>
        <h1 className="text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">Search the known-good answers first.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">FAQs and internal how-tos, searchable by symptom, category, or the words you already used in the ticket.</p>
      </div>
      <div className="relative max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Wi-Fi, VPN, password, laptop…"
          className="focus-ring h-12 w-full rounded-2xl border border-input bg-card pl-10 pr-4 text-sm outline-none"
          data-testid="input-knowledge-search"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category} className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">{category}</span>
        ))}
      </div>
      {articlesQuery.isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Loading articles…</div>
      ) : articles.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No articles match that search.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-[24px] border border-border bg-card p-5 shadow-xs" data-testid={`article-${article.id}`}>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <BookOpen size={14} className="text-accent" />
                {article.category}
              </div>
              <h2 className="mt-3 text-lg font-extrabold tracking-[-0.03em]">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.summary}</p>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-foreground/80">{article.body}</pre>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
