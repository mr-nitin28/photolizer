export interface PassportConfig {
  width_mm: number;
  height_mm: number;
  dpi: number;
  background: string;
  gridRows: number;
  gridCols: number;
}

export const defaultPassportConfig: PassportConfig = {
  width_mm: 35,
  height_mm: 45,
  dpi: 300,
  background: "white",
  gridRows: 2,
  gridCols: 2,
};
