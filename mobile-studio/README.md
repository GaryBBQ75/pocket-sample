# Pocket Studio — mobile exploration

A new, separate touch-first sampler. The original MPC-inspired Pocket Sample remains deployed and archived at https://pocket-sample-gary.gary-legrill.chatgpt.site/ and in the GitHub branch `archive/mpc-v18` (commit 61210e30d00f130eae4dff17020b64900bf34cc4). This project uses a different Site and IndexedDB database; it never modifies the old app's local projects.

## Product structure

Three persistent spaces: **Jouer**, **Composer**, **Remixer**. Pads and controls are sized to the viewport rather than placed on a scrolling document. Editing a sound opens a separate three-tab dialog (cut, tone, playback). A scale keyboard, sound sources, kits, tempo and projects use focused dialogs. Smaller screens and landscape may scroll within a focused dialog when necessary; main playing screens do not require page scrolling. The same bottom navigation and transport stay fixed.

- 64 pads across four banks, original procedural starter sounds (four kits).
- Record microphone, import audio, trim with waveform handles, normalize selection, reverse selection, nondestructive slicing to empty pads, duplicate, mute, exclusive solo, stop selected sound.
- Three playback modes: one-shot, gated, toggled loop. Stereo audio and per-voice pitch, level, pan and attack/release.
- Eight loops, 1–4 bars. Step editing and live overdub, scale keyboard, metronome, count-in, swing, copy to next empty loop and queued loop launch.
- Global XY high/low-pass filter + reverb, tempo delay and saturation. Touch release resets XY unless held. These are independent DSP interpretations, not copied Koala/Circuit/Akai engines.
- Undo (8 states subject to memory budget), local autosave, JSON project import/export, stereo WAV loop export with current effects and tails, compressed performance recording (2 minutes maximum).
- Legacy Pocket Sample project import: first 64 pads, first 8 sequences, up to 4 bars. Advanced effects, automation, note-specific slice bounds and complex signatures are not migrated. Export a copy from the old app before importing.

## Limits / deliberate exclusions

This is a first playable redesign, not full MPC parity. No time stretch, stem separation, MIDI hardware synchronization or proprietary bank imports. Effects gesture state is live, not saved as automation. Current editing features target a useful everyday subset. 60 seconds per sample, 240 seconds mono-equivalent PCM project capacity; generated original sounds are CC0 as in the source app. No external service or dependencies.

Use HTTPS for microphone and browser audio features. Physical mobile latency, multitouch behavior, OS file pickers and microphones still need testing on real Android/iPad devices. The cloud browser can validate UI, simulated interactions and rendered audio, not real device latency.

## Validation

`node tests/model.cjs` checks data validation, snapshots, chords, serialization and limited legacy migration. `tests/browser.js` is a manual browser test harness to temporarily load in a test copy; it restores the initial project and exercises real Web Audio, gating, slicing, undo, copying, effects rendering and IndexedDB. Do not include test harnesses in deployment.

Serve `dist/` using the managed Sites preview or any static HTTPS host. No build required.
