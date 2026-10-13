import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding } from "@/components/service-landing";
import { videoProduction as data } from "@/service-pages";

export const Route = createFileRoute("/services_/video-production-editing")({ component: () => <ServiceLanding data={data} />, head: () => ({ meta: [{ title: "Video Production & Editing | Better Found Online" }, { name: "description", content: "Video editing, promotional content, trailers, and advertisement videos for brands that need clear messaging and polished visual communication." }, { property: "og:title", content: "Video Production & Editing | Better Found Online" }, { property: "og:description", content: "Video editing, promotional content, trailers, and advertisement videos for clear, polished visual communication." }], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services/video-production-editing" }] }) });
