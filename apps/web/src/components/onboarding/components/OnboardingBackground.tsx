export function OnboardingBackground() {
  return (
    <>
      {/* Background image - light mode */}
      <div
        className="fixed inset-0 dark:hidden pointer-events-none"
        style={{
          backgroundImage: "url(/screen.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      ></div>

      {/* Background image - dark mode */}
      <div
        className="fixed inset-0 hidden dark:block pointer-events-none"
        style={{
          backgroundImage: "url(/screen-dark.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      ></div>
    </>
  );
}
