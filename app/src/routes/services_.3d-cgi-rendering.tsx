import { createFileRoute } from "@tanstack/react-router";
import { ServiceLanding } from "@/components/service-landing";
import { cgiRendering as data } from "@/service-pages";

export const Route = createFileRoute("/services_/3d-cgi-rendering")({ component: () => <ServiceLanding data={data} />, head: () => ({ meta: [{ title: "3D Design, CGI & Rendering | Better Found Online" }, { name: "description", content: "Explore 3D modeling, CGI, product visuals, digital environments, rendering, and visual effects for promotional and brand content." }, { property: "og:title", content: "3D Design, CGI & Rendering | Better Found Online" }, { property: "og:description", content: "3D modeling, CGI, rendering, and visual effects for promotional and brand content." }], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services/3d-cgi-rendering" }] }) });
