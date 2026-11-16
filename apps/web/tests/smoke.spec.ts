import { test, expect } from "@playwright/test";

test("public page renders profile and handles chat stream", async ({ page }) => {
  // Mock public site API endpoint
  await page.route("**/public/sites/alex-johnson", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        slug: "alex-johnson",
        template: "default",
        theme: "light",
        bot_enabled: true,
        name: "Alex Johnson",
        headline: "Staff Software Engineer",
        summary: "10+ years architecting distributed systems.",
        contact: { email: "alex@example.com", phone: null, links: [] },
        experiences: [
          {
            role: "Staff Infrastructure Engineer",
            company: "Acme Cloud",
            start_date: "2021-02",
            description: "Distributed systems and Kafka pipelines.",
          },
        ],
        projects: [
          {
            name: "VectorStore-RS",
            description: "High-performance vector search engine.",
          },
        ],
        skills: [{ name: "Rust" }, { name: "Python" }],
        educations: [],
        certifications: [],
      }),
    });
  });

  // Mock SSE chat streaming endpoint
  await page.route("**/public/chat/stream", async (route) => {
    const sseResponse = [
      'event: sources\ndata: {"sources": [{"title": "Staff Engineer at Acme"}]}\n\n',
      'event: token\ndata: {"token": "Alex "}\n\n',
      'event: token\ndata: {"token": "is "}\n\n',
      'event: token\ndata: {"token": "experienced."}\n\n',
      'event: done\ndata: {"done": true}\n\n',
    ].join("");

    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: sseResponse,
    });
  });

  // Load candidate public profile page
  await page.goto("http://localhost:3000/alex-johnson");

  // Verify candidate header renders
  await expect(page.locator("h1")).toContainText("Alex Johnson");
  await expect(page.locator("text=Staff Software Engineer")).toBeVisible();

  // Test submitting a question to the chat widget
  const input = page.locator('input[placeholder="Ask about skills, experience..."]');
  await input.fill("What is Alex's background?");
  await page.click('button:has-text("Ask")');

  // Verify streamed response renders in chat
  await expect(page.locator("text=Alex is experienced.")).toBeVisible({
    timeout: 5000,
  });
});

