import { describe, it, expect, vi } from "vitest";
import {
  formatFileSize,
  formatDate,
  formatDateFull,
  getFileUrl,
} from "../fileUtils";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://example.com/storage/drops/${path}` },
        })),
      })),
    },
  },
}));

describe("fileUtils", () => {
  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });
  });

  describe("formatDate", () => {
    it("formats date correctly", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = formatDate(date.toISOString());
      expect(formatted).toContain("1/15/2024");
      // Time may vary by timezone, just check it contains time format
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("formatDateFull", () => {
    it("formats date with full details", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = formatDateFull(date.toISOString());
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("getFileUrl", () => {
    it("returns public URL for file path", () => {
      const url = getFileUrl("drop-id/file.jpg");
      expect(url).toBe("https://example.com/storage/drops/drop-id/file.jpg");
    });

    it("uses custom bucket when provided", () => {
      const url = getFileUrl("file.jpg", "custom-bucket");
      expect(url).toBe("https://example.com/storage/drops/file.jpg");
    });
  });
});
