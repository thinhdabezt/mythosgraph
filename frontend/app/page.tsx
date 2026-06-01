import Link from "next/link";

const routes = [
  "/explore",
  "/entities/zeus",
  "/creatures/minotaur",
  "/traditions/olympian",
  "/graph",
  "/api-playground",
  "/admin/login",
  "/admin/entities",
  "/admin/relations",
  "/admin/taxonomies",
  "/admin/sources",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-semibold">MythosGraph Frontend</h1>
      <p className="text-muted-foreground">Starter routes scaffolded with Next.js App Router.</p>
      <ul className="space-y-2">
        {routes.map((route) => (
          <li key={route}>
            <Link className="text-primary underline-offset-4 hover:underline" href={route}>
              {route}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
