// HTTP Client interface placeholder for API interaction
export const createHttpClient = (baseURL: string) => {
  return {
    get: async <T>(url: string): Promise<T> => {
      throw new Error("HTTP Client placeholder - implementation comes later");
    },
    post: async <T>(url: string, data?: any): Promise<T> => {
      throw new Error("HTTP Client placeholder - implementation comes later");
    },
  };
};
