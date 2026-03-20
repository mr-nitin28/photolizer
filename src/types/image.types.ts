export interface RemoveBgResponse {
  success: boolean;
  image?: string; // Base64 encoded or URL
  error?: string;
}

export interface GeneratePdfRequest {
  imageBase64: string; // The base64 output from remove-bg
}

export interface GeneratePdfResponse {
  success: boolean;
  pdfBase64?: string; // The base64 generated PDF
  error?: string;
}
