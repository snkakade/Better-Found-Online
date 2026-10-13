import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding } from "@/components/service-landing";
import { motionGraphics as data } from "@/service-pages";

export const Route = createFileRoute("/services_/motion-graphics-animation")({ component: () => <ServiceLanding data={data} />, head: () => ({ meta: [{ title: "Motion Graphics & 2D Animation | Better Found Online" }, { name: "description", content: "Motion graphics and 2D animation for brand communication, promotional content, digital campaigns, and visual storytelling." }, { property: "og:title", content: "Motion Graphics & 2D Animation | Better Found Online" }, { property: "og:description", content: "Motion graphics and 2D animation for campaigns, brand communication, and visual storytelling." }], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services/motion-graphics-animation" }] }) });
