import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.elpulpo.darts",
    appName: "darts-capital",
    webDir: "dist",
    server: {
        url: "https://darts-capital.vercel.app/",
    },
};

export default config;
