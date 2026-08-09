// Socket.io client wrapper placeholder for live queue updates
export const initQueueSocket = (serverUrl: string) => {
  return {
    joinQueue: (doctorId: string, clinicId: string) => {},
    leaveQueue: (doctorId: string, clinicId: string) => {},
    onTokenUpdate: (callback: (data: any) => void) => {},
  };
};
