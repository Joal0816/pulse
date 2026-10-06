import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "tech.joalvergs.pulse",
  appName: "Pulse Telemetry",
  webDir: "public",
  server: {
    // Allows loading live deployed dashboard or fallback to offline bundled shell
    url: "https://pulse.joalvergs.tech",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
