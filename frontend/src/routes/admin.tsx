import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "CoreHex Admin Console" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});