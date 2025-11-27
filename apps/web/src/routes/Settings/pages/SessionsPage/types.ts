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

// Database types for RPC functions
export interface DatabaseSession {
  id: string;
  device_os: string | null;
  device_browser: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  last_activity: string;
  created_at: string;
  is_current: boolean;
}

export interface DatabaseLoginHistory {
  id: string;
  created_at: string;
  status: "success" | "failed";
  ip_address: string | null;
  device_info: string | null;
}
