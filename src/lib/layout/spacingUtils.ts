import { defaultPassportConfig } from "@/config/passportConfig";
import { defaultSpacingConfig } from "./layoutConfig";

export function getDpiPixels(mm: number, dpi: number = defaultPassportConfig.dpi) {
  return Math.round((mm / 25.4) * dpi);
}

export function calculateGrid(rows: number, cols: number) {
  const { width_mm, height_mm, dpi } = defaultPassportConfig;
  const { innerSpacingMm } = defaultSpacingConfig;

  const itemWidthPx = getDpiPixels(width_mm, dpi);
  const itemHeightPx = getDpiPixels(height_mm, dpi);
  const spacingPx = getDpiPixels(innerSpacingMm, dpi);

  const totalGridWidthPx = (cols * itemWidthPx) + ((cols - 1) * spacingPx);
  const totalGridHeightPx = (rows * itemHeightPx) + ((rows - 1) * spacingPx);

  return {
    itemWidthPx,
    itemHeightPx,
    spacingPx,
    totalGridWidthPx,
    totalGridHeightPx
  };
}
