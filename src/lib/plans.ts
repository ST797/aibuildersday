export const plans = [
  {
    id: "quarter",
    name: "Studio Quarter",
    price: 50,
    cadence: "per quarter",
    summary: "Three months with the crew. Every story you start in that season gets a full production pass.",
    includes: [
      "Stories for the whole quarter",
      "Story Director, World Curator, Shot Director, and Continuity on each project",
      "The prompt studio, from cast through light",
      "The shared library of worlds, people, wardrobe, props, and lenses",
    ],
    fit: "For a season of making, when you want the studio open.",
  },
  {
    id: "bundle",
    name: "Production Bundle",
    price: 80,
    cadence: "one purchase",
    summary: "The quarter, plus the right to take the prompts you export and use them outside PREVIEWS.",
    includes: [
      "Everything in Studio Quarter",
      "Usage rights for prompts exported during the quarter",
      "One package you can hand to an image or video model",
      "A single choice, not a bill that renews itself",
    ],
    fit: "For a story that is going out into the world.",
  },
  {
    id: "rights",
    name: "Usage Rights",
    price: 40,
    cadence: "one purchase",
    summary: "A license for work you already made. Use the prompts and production notes beyond the studio.",
    includes: [
      "Rights to use prompts and notes from your studio",
      "Paste them into image and video tools",
      "Your stories and library stay where they are",
      "Does not open a new quarter with the crew",
    ],
    fit: "For finished work you want to keep using.",
  },
] as const;

export type PlanId = (typeof plans)[number]["id"];

export function isPlanId(value: unknown): value is PlanId {
  return plans.some((plan) => plan.id === value);
}

export function findPlan(id: string | null | undefined) {
  return plans.find((plan) => plan.id === id) ?? null;
}
