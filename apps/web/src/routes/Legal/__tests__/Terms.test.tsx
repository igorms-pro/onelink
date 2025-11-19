import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Terms from "../Terms";
import "../../../lib/i18n";

describe("Terms", () => {
  it("renders terms of service page", () => {
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-title")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-title")).toHaveTextContent(
      /terms of service/i,
    );
  });

  it("renders terms description", () => {
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-description")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-description")).toHaveTextContent(
      /please read these terms/i,
    );
  });

  it("renders last updated date", () => {
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("legal-page-last-updated")).toBeInTheDocument();
    expect(screen.getByTestId("legal-page-last-updated")).toHaveTextContent(
      /last updated/i,
    );
  });

  it("renders terms sections", () => {
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>,
    );

    // Check for section using data-testid
    expect(screen.getByTestId("legal-section-acceptance")).toBeInTheDocument();
    expect(
      screen.getByTestId("legal-section-title-acceptance"),
    ).toHaveTextContent(/acceptance of terms/i);
  });

  it("renders back button", () => {
    render(
      <MemoryRouter>
        <Terms />
      </MemoryRouter>,
    );

    const backButton = screen.getByTestId("legal-back-button");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent(/back/i);
  });
});
