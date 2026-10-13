import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding } from "@/components/service-landing";
import { socialMedia as data } from "@/service-pages";

export const Route = createFileRoute("/services_/social-media-management")({ component: () => <ServiceLanding data={data} />, head: () => ({ meta: [{ title: "Social Media Management | Better Found Online" }, { name: "description", content: "Social media content planning, creative coordination, publishing, and ongoing management to help businesses communicate consistently." }, { property: "og:title", content: "Social Media Management | Better Found Online" }, { property: "og:description", content: "Content planning, creative coordination, publishing, and ongoing social media management." }], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services/social-media-management" }] }) });
