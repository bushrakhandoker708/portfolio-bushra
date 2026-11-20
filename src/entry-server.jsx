import { StrictMode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Writable } from "node:stream";
import App from "./App";

export { pages, NOT_FOUND, redirects } from "./data/pages";
export { SITE_URL, LAST_UPDATED } from "./data/site";

/** Render a route to HTML, waiting for lazy routes so the output is complete. */
export function render(url) {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString();
        cb();
      },
      final(cb) {
        resolve(html);
        cb();
      },
    });
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(sink);
        },
        onShellError: reject,
        onError: reject,
      },
    );
  });
}
