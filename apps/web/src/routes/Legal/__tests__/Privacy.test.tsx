import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Privacy from "../Privacy";
import "../../../lib/i18n";

describe("Privacy", () => {
  it("renders privacy policy page", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-title")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-title")).toHaveTextContent(
      /privacy policy/i,
    );
  });

  it("renders privacy description", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-description")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-description")).toHaveTextContent(
      /learn how onelink collects/i,
    );
  });

  it("renders last updated date", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-last-updated")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-last-updated")).toHaveTextContent(
      /last updated/i,
    );
  });

  it("renders privacy sections", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );

    // Check for section using data-testid
    expect(
      screen.getByTestId("legal-section-introduction"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("legal-section-title-introduction"),
    ).toHaveTextContent(/introduction/i);
  });

  it("renders back to auth link", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );

    const backLink = screen.getByTestId("legal-back-to-auth-link");
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveTextContent(/back to sign in/i);
  });
});
