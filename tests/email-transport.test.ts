import { afterEach, describe, expect, it, vi } from "vitest";
import net from "node:net";
import {
  sendTransactionalEmail,
  isEmailProviderConfigured,
} from "@/lib/server/email";
afterEach(() => vi.unstubAllEnvs());
describe("Email delivery transport, without external recipients", () => {
  it("reports missing configuration truthfully", async () => {
    for (const key of ["RESEND_API_KEY", "SMTP_HOST", "SMTP_USER", "SMTP_PASS"])
      vi.stubEnv(key, "");
    expect(isEmailProviderConfigured().configured).toBe(false);
    expect(
      (
        await sendTransactionalEmail({
          to: "test@example.invalid",
          subject: "Test",
          text: "Test",
          html: "<p>Test</p>",
        })
      ).notConfigured,
    ).toBe(true);
  });
  it("sends a real MIME message and PDF attachment through a local SMTP fixture", async () => {
    let received = "";
    const server = net.createServer((socket) => {
      socket.setEncoding("utf8");
      socket.write("220 localhost fixture\r\n");
      let buffer = "",
        data = false;
      socket.on("data", (chunk: string) => {
        buffer += chunk;
        while (buffer.includes("\r\n")) {
          const index = buffer.indexOf("\r\n"),
            line = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          if (data) {
            if (line === ".") {
              data = false;
              socket.write("250 queued locally\r\n");
            } else received += line + "\n";
            continue;
          }
          if (line.startsWith("EHLO"))
            socket.write("250-localhost\r\n250 AUTH PLAIN\r\n");
          else if (line.startsWith("AUTH"))
            socket.write("235 authenticated\r\n");
          else if (line === "DATA") {
            data = true;
            socket.write("354 send data\r\n");
          } else if (line === "QUIT") {
            socket.end("221 bye\r\n");
          } else socket.write("250 ok\r\n");
        }
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("SMTP_HOST", "127.0.0.1");
    vi.stubEnv("SMTP_PORT", String((server.address() as net.AddressInfo).port));
    vi.stubEnv("SMTP_USER", "local-user");
    vi.stubEnv("SMTP_PASS", "local-password");
    try {
      const outcome = await sendTransactionalEmail({
        to: "test@example.invalid",
        subject: "Local reflection report",
        text: "Selected reflection summary",
        html: "<p>Selected reflection summary</p>",
        attachments: [
          {
            filename: "report.pdf",
            content: Buffer.from("%PDF-fixture"),
            contentType: "application/pdf",
          },
        ],
      });
      expect(outcome).toMatchObject({ ok: true, provider: "smtp" });
      expect(received).toContain("Subject: Local reflection report");
      expect(received).toContain("Content-Type: application/pdf");
      expect(received).toContain("JVBERi1maXh0dXJl");
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
