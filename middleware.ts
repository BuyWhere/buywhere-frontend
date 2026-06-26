import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { classifyAgent, generateDistinctId } from './lib/agent-ua';
import { ACTIVE_BLOG_SLUGS } from './lib/active-blog-slugs.generated';


const POSTHOG_HOST = 'https://us.i.posthog.com';
const POSTHOG_KEY =
  process.env.POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY;

const SKIP_PATTERNS = [
  /^\/_next\//,
  /^\/api\//,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i,
];

const CAPTURE_WELL_KNOWN = [
  /^\/.well-known\//,
  /^\/robots\.txt$/,
  /^\/sitemap.*\.xml$/,
  /^\/apps\.json$/,
  /^\/agents\.json$/,
];

function shouldSkip(pathname: string): boolean {
  if (SKIP_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return true;
  }
  return false;
}

function shouldCapture(pathname: string): boolean {
  if (shouldSkip(pathname)) {
    return false;
  }
  if (CAPTURE_WELL_KNOWN.some((pattern) => pattern.test(pathname))) {
    return true;
  }
  return true;
}

function getCanonicalUrl(request: NextRequest): URL {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');
  const url = new URL(request.url);

  if (host) {
    url.host = host;
  }

  if (forwardedProto) {
    url.protocol = `${forwardedProto}:`;
  }

  return url;
}

async function capturePageview(request: NextRequest) {
  if (!POSTHOG_KEY) {
    return;
  }

  const ua = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() || 'unknown';

  const classification = classifyAgent(ua);
  const distinctId = await generateDistinctId(ip, ua);

  const url = getCanonicalUrl(request);
  const pathname = url.pathname;

  const payload = {
    api_key: POSTHOG_KEY,
    event: 'pageview_server',
    distinct_id: distinctId,
    timestamp: new Date().toISOString(),
    properties: {
      $raw_user_agent: ua,
      is_bot: classification.is_bot,
      agent_family: classification.agent_family,
      $current_url: url.toString(),
      path: pathname,
      pathname,
      host: url.hostname,
      referer: referer,
    },
  };

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
  }
}

export async function middleware(request: NextRequest) {
  const pathname = getCanonicalUrl(request).pathname;

  // Return 410 Gone for /blog/<slug> and /blog/<slug>/ not in the active allowlist.
  // Without this, trailing-slash forms 308-redirect to a near-match page instead
  // of returning 410, wasting ~540 weekly impressions (BUY-57626).
  const blogSlugMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogSlugMatch) {
    const slug = blogSlugMatch[1];
    if (!ACTIVE_BLOG_SLUGS.has(slug)) {
      return new NextResponse(null, { status: 410 });
    }
  }

  if (shouldCapture(pathname)) {
    capturePageview(request).catch(() => {});
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
