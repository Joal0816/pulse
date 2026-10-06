import { describe, expect, it } from "bun:test";
import { parseUserAgent } from "./analytics";
import { MONITORED_SITES } from "./types";

describe("Pulse Telemetry Core", () => {
  it("should have all 7 required joalvergs.tech domains registered", () => {
    expect(MONITORED_SITES.length).toBe(7);
    const hosts = MONITORED_SITES.map((s) => s.host);
    expect(hosts).toContain("joalvergs.tech");
    expect(hosts).toContain("agapai.joalvergs.tech");
    expect(hosts).toContain("aruga.joalvergs.tech");
    expect(hosts).toContain("barangay-connect.joalvergs.tech");
    expect(hosts).toContain("cup.joalvergs.tech");
    expect(hosts).toContain("oddjobs.joalvergs.tech");
    expect(hosts).toContain("oink.joalvergs.tech");
  });

  it("should accurately parse browser, os and device from User-Agent", () => {
    const desktopChrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const res1 = parseUserAgent(desktopChrome);
    expect(res1.browser).toBe("Chrome");
    expect(res1.os).toBe("Windows");
    expect(res1.device).toBe("desktop");

    const mobileSafari = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const res2 = parseUserAgent(mobileSafari);
    expect(res2.browser).toBe("Safari");
    expect(res2.os).toBe("iOS");
    expect(res2.device).toBe("mobile");
  });
});
