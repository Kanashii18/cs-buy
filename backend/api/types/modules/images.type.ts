export interface UploadFile {
  buffer: Buffer;
}

export interface ImageResponse {
  id: string;
  url: string;
  originalUrl: string;
}

export type UploadCallback = (
  error: Error | null,
  response?: ImageResponse
) => void;