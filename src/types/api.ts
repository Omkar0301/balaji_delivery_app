export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
