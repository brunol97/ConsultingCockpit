export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Welcome</h1>
      <p className="text-zinc-600">
        Use the links above to log in, register, manage organizations, and view
        projects. This instance is wired to your hosted Supabase project.
      </p>
      <div className="flex gap-3">
        <a
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground shadow hover:bg-primary/90"
          href="/login"
        >
          Go to Login
        </a>
        <a
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
          href="/register"
        >
          Create account
        </a>
      </div>
    </div>
  );
}
