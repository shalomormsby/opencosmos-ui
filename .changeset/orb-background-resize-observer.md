---
'@opencosmos/ui': patch
---

Fix `OrbBackground` misalignment after layout shifts (e.g. sidebar collapse/expand, late hydration). The component previously only listened to `window.resize`, so a container that changed size without a window resize would leave the WebGL canvas at its initial dimensions and the orb drawn off-center. Replaced with a `ResizeObserver` on the container, retaining the window listener as a safety net.
