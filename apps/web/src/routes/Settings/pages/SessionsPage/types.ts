export interface Session {
  id: string;
  device: {
    os: string;
    browser: string;
  };
  location: {
    ip: string;
    city?: string;
    country?: string;
  };
  lastActivity: string;
  isCurrent: boolean;
}

export interface LoginHistory {
  id: string;
  date: string;
  status: "success" | "failed";
  ip: string;
  device: string;
}
