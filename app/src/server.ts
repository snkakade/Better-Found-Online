import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders } from "./lib/security-headers.server";
import { applyMediaRange } from "./lib/media-range.server";
import { mediaAssetSizes } from "./media-asset-sizes";
import { handleConsoleApi } from "./lib/console-api.server";
import type { D1Database } from "@cloudflare/workers-types";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type AssetBinding = {
  fetch: (request: Request) => Promise<Response> | Response;
};

type RuntimeEnv = {
  ASSETS?: AssetBinding;
  DB?: D1Database;
  CONSOLE_BOOTSTRAP_TOKEN?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_API_KEY?: string;
  TWILIO_API_SECRET?: string;
  TWILIO_CALLER_ID?: string;
  TWILIO_TWIML_APP_SID?: string;
  TWILIO_MESSAGING_SERVICE_SID?: string;
  TWILIO_SMS_ENABLED?: string;
  TWILIO_A2P_BRAND_STATUS?: string;
  TWILIO_A2P_CAMPAIGN_STATUS?: string;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: RuntimeEnv, ctx: unknown) {
    try {
      // Cloudflare Pages advanced mode sends every request through this worker.
      // Let its asset binding serve fingerprinted JS/CSS, fonts and media while
      // keeping document requests in TanStack Start for server-rendered SEO.
      const url = new URL(request.url);
      const { pathname } = url;
      const consoleHost = url.hostname === "console.betterfoundonline.com";
      const publicWebsiteHost =
        url.hostname === "betterfoundonline.com" || url.hostname === "www.betterfoundonline.com";
      const isConsoleUiPath = pathname === "/console" || pathname.startsWith("/console/");
      const isDocumentRequest = request.method === "GET" || request.method === "HEAD";

      if (pathname.startsWith("/api/console/")) {
        return applySecurityHeaders(await handleConsoleApi(request, env));
      }

      if (isDocumentRequest && publicWebsiteHost && isConsoleUiPath) {
        return applySecurityHeaders(
          new Response(null, {
            status: 308,
            headers: { location: "https://console.betterfoundonline.com/" },
          }),
        );
      }

      if (isDocumentRequest && consoleHost) {
        if (
          pathname === "/console" ||
          pathname === "/console/" ||
          pathname === "/console/shell" ||
          pathname === "/console/shell.html" ||
          pathname === "/index.html"
        ) {
          return applySecurityHeaders(
            new Response(null, { status: 308, headers: { location: "/" } }),
          );
        }

        if (pathname === "/robots.txt") {
          return applySecurityHeaders(
            new Response("User-agent: *\nDisallow: /\n", {
              headers: {
                "content-type": "text/plain; charset=utf-8",
                "cache-control": "public, max-age=3600",
                "x-robots-tag": "noindex, nofollow",
              },
            }),
          );
        }
      }

      if (isDocumentRequest && env.ASSETS) {
        // Keep the legacy /console route available only in local/preview builds.
        // Production website traffic is redirected to the dedicated subdomain above.
        if (!consoleHost && !publicWebsiteHost && pathname === "/console") {
          return new Response(null, { status: 308, headers: { location: "/console/" } });
        }

        if (
          (!consoleHost && !publicWebsiteHost && pathname === "/console/") ||
          (consoleHost && pathname === "/")
        ) {
          const assetUrl = new URL(request.url);
          // Fetch the clean asset URL so Pages does not leak its internal
          // /console/shell route into the browser address bar.
          assetUrl.pathname = "/console/shell";
          const response = await env.ASSETS.fetch(new Request(assetUrl, request));
          const headers = new Headers(response.headers);
          headers.set("cache-control", "no-store");
          headers.set("x-robots-tag", "noindex, nofollow");
          return applySecurityHeaders(
            new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            }),
            { allowMicrophone: true },
          );
        }

        if (consoleHost && pathname === "/console/sw.js") {
          const response = await env.ASSETS.fetch(request);
          const headers = new Headers(response.headers);
          headers.set("service-worker-allowed", "/");
          return applySecurityHeaders(
            new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            }),
          );
        }
      }

      // The console subdomain belongs exclusively to the CRM. Do not expose
      // the marketing site's routes there; keep only the console's static files
      // and the shared brand/font assets used by its shell.
      if (
        isDocumentRequest &&
        consoleHost &&
        pathname !== "/" &&
        !pathname.startsWith("/console/") &&
        !pathname.startsWith("/assets/")
      ) {
        return applySecurityHeaders(
          new Response(null, { status: 308, headers: { location: "/" } }),
        );
      }

      const isStaticAsset =
        pathname.startsWith("/assets/") ||
        pathname.startsWith("/console/") ||
        pathname.startsWith("/presets/") ||
        /\.[a-zA-Z0-9]{2,16}$/.test(pathname);

      if ((request.method === "GET" || request.method === "HEAD") && isStaticAsset && env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        const publicVideo = !consoleHost && pathname.startsWith("/assets/") && /\.(mp4|webm|m4v)$/i.test(pathname);
        return applySecurityHeaders(publicVideo ? applyMediaRange(request, response, mediaAssetSizes[pathname]) : response);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
