import { ImageResponse } from "next/og";

import {
  OG_COLORS,
  SITE_TITLE,
} from "@/lib/constants/site";

export const runtime = "edge";

export const alt = SITE_TITLE;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/** Dynamic Open Graph image using ui-context.md design tokens. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "64px 80px",
          backgroundColor: OG_COLORS.bgBase,
          color: OG_COLORS.textPrimary,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: OG_COLORS.accentPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: OG_COLORS.textMuted,
            }}
          >
            Repack
          </span>
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          {SITE_TITLE}
        </div>

        <div
          style={{
            fontSize: "28px",
            lineHeight: 1.4,
            color: OG_COLORS.textMuted,
            maxWidth: "880px",
          }}
        >
          Mevcut içeriğinizi tek tıkla LinkedIn, X, Instagram ve daha fazlası
          için yeniden paketleyin.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: OG_COLORS.accentPrimary,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
