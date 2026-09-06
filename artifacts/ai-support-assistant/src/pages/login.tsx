import { Headphones, LifeBuoy, Loader2 } from 'lucide-react';
import { useListDemoAccounts, useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/lib/theme';
import { useLocation } from 'wouter';

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const accountsQuery = useListDemoAccounts();
  const loginMutation = useLogin();
  const accounts = accountsQuery.data ?? [];

  const signIn = (email: string) => {
    loginMutation.mutate(
      { data: { email } },
      {
        onSuccess: (user) => {
          login(user);
          setLocation(user.role === 'support' ? '/dashboard' : '/');
        },
      },
    );
  };

  return (
    <div className="noise flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10 text-foreground">
      <div className="absolute right-5 top-5">
        <ThemeToggle variant="labeled" />
      </div>
      <div className="w-full max-w-[560px] rounded-[28px] border border-border bg-card p-8 shadow-2xl sm:p-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <LifeBuoy size={22} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.05em]">Sign in to IT Support</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Choose a workplace account. Employees get guided troubleshooting and the knowledge base. Support gets the service desk and dashboard.
        </p>
        <div className="mt-8 space-y-3">
          {accountsQuery.isLoading && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading accounts…
            </p>
          )}
          {accountsQuery.isError && (
            <p className="text-xs text-destructive" role="alert">
              Accounts couldn’t be loaded. Check that the API is running.
            </p>
          )}
          {accounts.map((account) => {
            const isSupport = account.role === 'support';
            return (
              <button
                key={account.email}
                type="button"
                disabled={loginMutation.isPending}
                onClick={() => signIn(account.email)}
                className="focus-ring flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-accent disabled:opacity-55"
                data-testid={`button-login-${account.email}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold">{account.name}</span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    {account.email} · {account.department}
                  </span>
                </span>
                <span className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]">
                  {isSupport ? <Headphones size={12} /> : <LifeBuoy size={12} />}
                  {isSupport ? 'Support' : 'Employee'}
                </span>
              </button>
            );
          })}
        </div>
        {loginMutation.isPending && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Signing you in…
          </p>
        )}
        {loginMutation.isError && (
          <p className="mt-4 text-xs text-destructive" role="alert">
            That account could not be signed in. Try another account above.
          </p>
        )}
      </div>
    </div>
  );
}
