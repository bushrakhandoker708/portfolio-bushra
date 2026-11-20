import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { pages } from "../data/pages";
import { relevia } from "../data/research";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe("every route renders", () => {
  it.each(Object.keys(pages))("%s has exactly one h1, the skip link and main landmark", async (path) => {
    renderAt(path);
    const h1 = await screen.findAllByRole("heading", { level: 1 }, { timeout: 3000 });
    expect(h1).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("unknown routes and unknown project slugs show the 404 page", async () => {
    renderAt("/nope");
    expect(await screen.findByRole("heading", { level: 1, name: /does not exist/i })).toBeInTheDocument();
    renderAt("/projects/not-a-project");
    expect(await screen.findAllByRole("heading", { level: 1, name: /does not exist/i })).toHaveLength(2);
  });

  it("old routes redirect", async () => {
    renderAt("/my-works");
    expect(await screen.findByRole("heading", { level: 1, name: "Selected engineering work" })).toBeInTheDocument();
  });
});

describe("home page", () => {
  it("shows the agreed identity and actions", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: "Bushra Khandoker" })).toBeInTheDocument();
    const tagline = screen.getByText((_, el) => el?.tagName === "P" && /^Computer Science Undergraduate\s*\|\s*,?\s*AI\/ML Engineering & Independent Research$/.test(el.textContent.trim()));
    expect(tagline).toBeInTheDocument();
    expect(screen.getByText(/Exploring reliable language models, reproducible machine learning and resource-efficient AI systems/)).toBeInTheDocument();
    for (const name of [/Explore research/i, /View projects/i, /CV/, /GitHub/]) {
      expect(screen.getAllByRole("link", { name }).length).toBeGreaterThan(0);
    }
  });

  it("does not describe the author as an established researcher or expert", () => {
    renderAt("/");
    const text = document.body.textContent;
    expect(text).not.toMatch(/research scientist|published author|\bexpert\b|world-class|passionate/i);
  });
});

describe("Relevia case study", () => {
  it("shows the disclosure, non-clinical statement and data tables", async () => {
    renderAt("/research/relevia");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByText(relevia.notClinical)).toBeInTheDocument();
    expect(screen.getByText(relevia.disclosure)).toBeInTheDocument();
    // Each chart offers its data as a table.
    expect(document.querySelectorAll("figure details table").length).toBeGreaterThanOrEqual(4);
  });

  it("S2 confusion matrix shows the verified counts", async () => {
    renderAt("/research/relevia");
    const table = (await screen.findByRole("table", { name: /S2/ }));
    const cells = within(table).getAllByRole("cell").map((c) => c.textContent).filter(Boolean);
    expect(cells).toEqual(["18", "6", "0", "18"]);
  });
});

describe("mobile navigation", () => {
  it("menu button toggles and Escape closes it", () => {
    renderAt("/");
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("archive", () => {
  it("does not load the WebGL sketch until asked", async () => {
    renderAt("/archive");
    expect(await screen.findByRole("button", { name: /Start the physics sketch/ })).toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeNull();
  });
});
