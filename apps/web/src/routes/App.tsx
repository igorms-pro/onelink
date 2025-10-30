export default function App() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">OneMeet</h1>
      <p className="text-gray-600 mt-2">Share a single link. Route by intent.</p>
      <div className="mt-6 flex gap-3">
        <a className="rounded bg-black text-white px-4 py-2" href="/auth">Sign in</a>
        <a className="rounded border px-4 py-2" href="/igor">View sample profile</a>
      </div>
    </main>
  );
}
