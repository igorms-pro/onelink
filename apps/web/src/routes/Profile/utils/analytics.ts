import { PlanType, PlanTypeValue } from "@/lib/types/plan";

export function maybeInjectGA(plan: PlanTypeValue) {
  const gaId = import.meta.env.VITE_GA_ID as string | undefined;
  if (plan !== PlanType.PRO || !gaId) return;
  if (document.getElementById("ga-script")) return;

  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);

  const inline = document.createElement("script");
  inline.id = "ga-inline";
  inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
  document.head.appendChild(inline);
}
