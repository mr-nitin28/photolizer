export interface LayoutConfig {
  layoutType: number;
  rows: number;
  cols: number;
  custom?: boolean;
  border?: boolean;
}

export const LY_CONFIGS: Record<number, LayoutConfig> = {
  4: { layoutType: 4, rows: 2, cols: 2, border: true },
  5: { layoutType: 5, rows: 3, cols: 2, custom: true, border: true },
  6: { layoutType: 6, rows: 3, cols: 2, border: true },
};

export const defaultSpacingConfig = {
  innerSpacingMm: 5, // Gap between photos
  cuttingLineThicknessPx: 2, // Width of cutting guide
  marginMm: 10, // Global outer margin check area
};
