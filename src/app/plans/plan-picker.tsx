"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { plans, type PlanId } from "@/lib/plans";

export default function PlanPicker({ current }: { current: PlanId | null }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<PlanId | null>(current);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  async function choose(planId: PlanId) {
    if (pending || planId === chosen) return;
    setPending(planId);
    setError("");
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not save this plan.");
      setChosen(planId);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this plan.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="plans-board">
      {plans.map((plan) => {
        const selected = chosen === plan.id;
        return (
          <article className={`plan-card ${selected ? "selected" : ""}`} key={plan.id}>
            <p className="plan-price"><b>${plan.price}</b><span>{plan.cadence}</span></p>
            <h2>{plan.name}</h2>
            <p className="plan-summary">{plan.summary}</p>
            <ul>
              {plan.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="plan-fit">{plan.fit}</p>
            <button disabled={selected || pending !== null} onClick={() => choose(plan.id)} type="button">
              {selected ? "This is your plan" : pending === plan.id ? "Saving…" : chosen ? "Switch to this" : "Choose this plan"}
            </button>
          </article>
        );
      })}
      {error && <p className="plans-error">{error}</p>}
      {chosen && <p className="plans-saved">Saved on your studio. A card is not charged.</p>}
    </div>
  );
}
