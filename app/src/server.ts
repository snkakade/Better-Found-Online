import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders } from "./lib/security-headers.server";
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

      if (pathname.startsWith("/api/console/")) {
        return applySecurityHeaders(await handleConsoleApi(request, env));
      }

      if ((request.method === "GET" || request.method === "HEAD") && env.ASSETS) {
        if (pathname === "/console") {
          return new Response(null, { status: 308, headers: { location: "/console/" } });
        }
        const consoleHost = url.hostname === "console.betterfoundonline.com";
        if (pathname === "/console/" || (consoleHost && (pathname === "/" || pathname === "/index.html"))) {
          const assetUrl = new URL(request.url);
          assetUrl.pathname = "/console/shell.html";
          const response = await env.ASSETS.fetch(new Request(assetUrl, request));
          const headers = new Headers(response.headers);
          headers.set("cache-control", "no-store");
          headers.set("x-robots-tag", "noindex, nofollow");
          return applySecurityHeaders(new Response(response.body, { status: response.status, statusText: response.statusText, headers }), { allowMicrophone: true });
        }
      }

      const isStaticAsset =
        pathname.startsWith("/assets/") ||
        pathname.startsWith("/console/") ||
        pathname.startsWith("/presets/") ||
        /\.[a-zA-Z0-9]{2,8}$/.test(pathname);

      if ((request.method === "GET" || request.method === "HEAD") && isStaticAsset && env.ASSETS) {
        return applySecurityHeaders(await env.ASSETS.fetch(request));
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
