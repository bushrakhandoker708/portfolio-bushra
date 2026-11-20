import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { profile } from "../data/profile";

/*
 * Contact without a form or a server: the message goes from the visitor's own
 * mail app straight to Bushra, so nothing is stored or passed through a third
 * party. Topics pre-fill the subject so messages are easy to find and sort.
 */
export const TOPICS = [
  { label: "Research", subject: "Research: " },
  { label: "Postgraduate study", subject: "Postgraduate study: " },
  { label: "An engineering role", subject: "Engineering role: " },
  { label: "Just saying hello", subject: "Hello from your portfolio" },
];

export const mailto = (subject = "") =>
  `mailto:${profile.email}${subject ? `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Bushra,\n\n")}` : ""}`;

/** Copies the address; falls back to selecting it when the Clipboard API is unavailable. */
export function CopyEmail({ className = "" }) {
  const [state, setState] = useState("idle"); // idle | copied | select
  const field = useRef(null);
  const timer = useRef();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setState("copied");
    } catch {
      setState("select");
      window.setTimeout(() => field.current?.select(), 0);
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2500);
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button type="button" onClick={copy} className="btn btn-quiet min-h-[36px] px-4 py-1 text-sm">
        {state === "copied" ? "Copied ✓" : "Copy email"}
      </button>
      {state === "select" && (
        <input
          ref={field}
          readOnly
          value={profile.email}
          aria-label="Email address, selected for copying"
          className="rounded-md border border-white/15 bg-surface px-2 py-1 text-sm text-ink"
        />
      )}
      <span role="status" className="sr-only">
        {state === "copied" ? "Email address copied" : ""}
      </span>
    </span>
  );
}

/** The home page contact card: the address, a copy button and topic shortcuts. */
export function ContactCard() {
  const [topic, setTopic] = useState(null);
  const chosen = TOPICS.find((t) => t.label === topic);

  return (
    <div className="card relative overflow-hidden p-8 sm:p-10">
      <span aria-hidden="true" className="bubble absolute -right-10 -top-10 hidden h-40 w-40 opacity-80 sm:block" />
      <p className="poetic text-2xl">Every algorithm starts with a question.</p>
      <p className="prose-body mt-4">
        If you would like to talk about research, postgraduate study or something you are building, I would love to hear from you. Email is
        the best way to reach me. My code is on{" "}
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
          GitHub<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
        </a>
        .
      </p>

      <p className="mt-8 font-label text-xs font-semibold uppercase tracking-label text-accent" id="topic-label">
        What would you like to talk about?
      </p>
      <div role="group" aria-labelledby="topic-label" className="mt-3 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.label}
            type="button"
            aria-pressed={topic === t.label}
            onClick={() => setTopic((cur) => (cur === t.label ? null : t.label))}
            className={`btn min-h-[38px] px-4 py-1 text-sm ${topic === t.label ? "btn-primary" : "btn-quiet"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={mailto(chosen?.subject ?? "Hello from your portfolio")} className="btn btn-primary">
          Write to me
          <AnimatePresence mode="wait" initial={false}>
            {chosen && (
              <m.span key={chosen.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="font-normal">
                about {chosen.label.toLowerCase()}
              </m.span>
            )}
          </AnimatePresence>
        </a>
        <CopyEmail />
      </div>
      <p className="mt-4 text-sm text-faint">
        Opens your own mail app, addressed to <span className="text-muted">{profile.email}</span>. Nothing is sent through this website.
      </p>
    </div>
  );
}
