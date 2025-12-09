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
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
          href="/login"
        >
          Go to Login
        </a>
        <a
          className="rounded-md border px-4 py-2 text-sm text-black"
          href="/register"
        >
          Create account
        </a>
      </div>
    </div>
  );
}
