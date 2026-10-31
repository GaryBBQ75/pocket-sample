# Design decisions — Pocket Studio

The references inform workflow, not visual reproduction.

## References consulted

- Koala Quick Guide: https://manual.koalasampler.com/mobile/3-quick-guide/ — fast sound capture, direct sequence editing and separation of performance from sound collection.
- Novation sample tracks: https://userguides.novationmusic.com/hc/en-gb/articles/25494393500562-Using-Circuit-Rhythm-sample-tracks — stable grids and complementary sample/keyboard views.
- Novation mixing/performing: https://userguides.novationmusic.com/hc/en-gb/articles/26207066285074-Mixing-and-performing-on-your-Circuit-Rhythm — immediate global performance effects.
- Ableton Note manual: https://www.ableton.com/en/note/manual/ — idea capture, focused instruments and contextual editing.
- User-provided Koala phone screenshots (five): persistent sample/sequence/perform navigation, waveform pads, direct performance surfaces. No assets or proprietary code copied.

## Decisions

Three large bottom destinations; two actions that change data (sources and project management) remain separate from playing. A selected-sound card exposes editing without requiring a hidden gesture. Long press is a shortcut only on one-shot pads, so a gated sound can be held without unexpectedly opening an editor. No swipe-to-change-main-mode, to avoid conflict with performance drags and accidental navigation.

Each mode answers one question: “Which sound do I play?”, “Where does it land in the loop?”, “How do I transform the whole mix?”. Advanced controls appear where used. Kits and a sample beat make the blank state immediately usable. A relative minor-scale keyboard reduces accidental dissonance; it does not analyze or retune imported material.

Visual language: dark graphite canvas, cream type, lime transport and selection, soft four-group pad colors and compact waveform silhouettes. This abandons the hardware facade and the dense panel stack of the original app. Icons are accompanied by text for navigation, sound sources and key actions. Touch targets are typically 40–46px; pad dimensions adapt to available space. Projects are device-local; exports are the external safety copy.

Some tradeoffs remain: four groups of 16 pads are more legible than 128, 1–4 bars are easier to navigate than 128, and four musical effects are more discoverable than a catalog of dozens. These limits are deliberate in this first iteration and do not remove anything from the archived app.
