import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Example Test", () => {
  it("should render a button", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
  });

  it("should verify testing setup works", () => {
    expect(true).toBe(true);
  });
});
