import {type Context, Hono, type Next} from 'hono'; // https://hono.dev/docs/
import {html} from 'hono/html';
import {serveStatic} from 'hono/bun';

// Run a WebSocket to reload the client automatically during development
import "./reload-server";

const app = new Hono();

// Content Security Policy
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
const policies = [
  // The `report-uri` directive specifies where POST requests for violation reports will be sent.
  // NOTE: The `report-uri` directive will be replaced by report-to in the future.
  'report-uri /csp-report',
  // The `default-src` directive specifies that only resources from the current domain are allowed
  // unless overridden by a more specific directive.
  "default-src 'self'",
  // The `connect-src` directive specifies sending HTTP requests to the JSONPlaceholder API.
  // It also allows client-side JavaScript code to create a WebSocket.
  "connect-src 'self' https://jsonplaceholder.typicode.com ws:",
  // The `font-src` directive specifies allowing fonts from fonts.example.com and fonts.example.net.
  // 'font-src https://fonts.example.com https://fonts.example.net',
  // The `img-src` directive specifies allowing fonts from images.example.com and images.example.net.
  // 'img-src https://images.example.com https://images.example.net',
  // The `media-src` directive specifies allowing fonts from media.example.com and media.example.net.
  // 'media-src https://media.example.com https://media.example.net',
  // The `script-src-elem` directive specifies allowing script sources from js.example.com.
  // "script-src-elem 'self' https://js.example.com",
  "script-src-elem 'self'",
  // The `style-src-elem` directive specifies allowing the htmx library to insert style elements.
  // "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline'",
];
const csp = policies.join('; ');

// Default route handler
app.use('/*', (c: Context, next: Next) => {

  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);

  // Set the Content-Security-Policy header value
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  c.header('Content-Security-Policy', csp);

  // Set the Strict-Transport-Security header value
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  if (process.env.NODE_ENV !== "development") {
    const yearSeconds = 31536000;
    c.header(
      'Strict-Transport-Security',
      `max-age=${yearSeconds}; includeSubDomains`
    );
  }
  
  // Set the X-Content-Type-Options header value
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  // Blocks a request if the request destination is of type style and the MIME type 
  // is not text/css, or of type script and the MIME type is not a JavaScript MIME type.
  c.header('X-Content-Type-Options', 'nosniff');

  // Serve static files from the public directory
  const fn = serveStatic({
    root: './public',
    onFound: (_path, c) => {
      if (process.env.NODE_ENV !== "development") {
        c.header('X-Cache-Control', `public, immutable, max-age=900`)
      }
    },
    onNotFound: (path, c) => {
      console.log(`File not found, path:${path}, c.req.path:${c.req.path}`)
    },
  });
  return fn(c, next);
});

// Route handler to receive reports of CSP violations
app.post('/csp-report', async (c: Context) => {
  const json = await c.req.json();
  const report = json['csp-report'];
  let file = report['document-uri'];

  if (file.endsWith('/')) file = 'index.html';
  console.error(
    `${file} attempted to access ${report['blocked-uri']} which ` +
    `violates the ${report['effective-directive']} CSP directive.`
  );
  c.status(403); // Forbidden
  return c.text('CSP violation');
});

app.get("/validate-ip-address", (c: Context) => {
  // Validate the IP address is valid
  const ip_address = (c.req.query("ip-address") as string) || "";
  const is_valid_ipv4_address = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip_address);
  const is_valid_ipv6_address =
    /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/.test(ip_address);
  const is_valid =
    is_valid_ipv4_address || is_valid_ipv6_address ? true : false;
  // leftwards arrow: &larr; ← &#8592; u+2190 \u2190
  return c.text(`\u2190 The IP address entered is valid: ${is_valid}`);
});

// for Cloudflare Workers or Bun
export default {
  port: 3000,
  fetch: app.fetch,
};