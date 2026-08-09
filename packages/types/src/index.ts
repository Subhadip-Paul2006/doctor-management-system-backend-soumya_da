export * from "./user";
export * from "./appointment";
export * from "./queue";
export * from "./clinic";
export * from "./doctor";
export * from "./prescription";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}
