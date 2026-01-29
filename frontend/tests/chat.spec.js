import { test, expect } from "@playwright/test";

test("can ask a question and see an answer", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Ask something…").fill("dis bonjour");
    await page.getByRole("button", { name: "Send" }).click();

    const lastAssistant = page.locator('[data-testid="msg-assistant"]').last();
    await expect(lastAssistant).toBeVisible({ timeout: 15000 });
    await expect(lastAssistant).not.toContainText("(no text)");
    await expect(lastAssistant).not.toContainText("Error:");
});
