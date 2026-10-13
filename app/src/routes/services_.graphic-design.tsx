import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding } from "@/components/service-landing";
import { graphicDesign as data } from "@/service-pages";

export const Route = createFileRoute("/services_/graphic-design")({ component: () => <ServiceLanding data={data} />, head: () => ({ meta: [{ title: "Graphic Design Services | Better Found Online" }, { name: "description", content: "Creative graphic design for social media, marketing campaigns, promotional materials, and consistent digital brand communication." }, { property: "og:title", content: "Graphic Design Services | Better Found Online" }, { property: "og:description", content: "Graphic design for social media, marketing campaigns, and consistent digital brand communication." }], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services/graphic-design" }] }) });
