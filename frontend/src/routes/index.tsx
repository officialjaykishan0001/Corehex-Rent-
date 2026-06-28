import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoreHex Rental — Enterprise IT & AV Equipment Rentals" },
      { name: "description", content: "Rent laptops, desktops, projectors, sound systems, networking gear, printers, LED displays and event tech. Transparent pricing. Nationwide deployment. 24/7 support." },
      { property: "og:title", content: "CoreHex Rental — Enterprise IT & AV Equipment Rentals" },
      { property: "og:description", content: "Rent laptops, projectors, AV, networking and event tech with enterprise SLAs." },
    ],
  }),
  component: Landing,
});
