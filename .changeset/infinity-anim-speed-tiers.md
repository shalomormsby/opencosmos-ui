---
"@opencosmos/ui": minor
---

feat(ui): InfinityAnim speed tiers (+33% active, 25% idle)

Updates the `runWhile` prop logic for `InfinityAnim` to implement a three-tier speed system:
- `false` (Idle): Slowly drifts at 25% of default speed instead of completely stopping.
- `true` (Active): Boosts speed by +33% for visible energy while text is writing on.
- `undefined` (Always-on): Continues running at normal speed for backward compatibility.
