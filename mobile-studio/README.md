# Pocket Studio — mobile exploration

A new, separate touch-first sampler. The original MPC-inspired Pocket Sample remains deployed and archived at https://pocket-sample-gary.gary-legrill.chatgpt.site/ and in the GitHub branch `archive/mpc-v18` (commit 61210e30d00f130eae4dff17020b64900bf34cc4). This project uses a different Site and IndexedDB database; it never modifies the old app's local projects.

## Product structure

Four persistent spaces: **Pads / Son / Séquence / Effets**. Compact project/audio/MIDI/tempo header, fixed transport and navigation. Sound editing is a full workspace with cut, settings and playback tabs. Selection, mute and exclusive solo are available directly on the grid; volume, mute/solo and stop selected pad are also available below it. Editing and effect parameters may scroll internally on smaller screens.

- 64 pads across four banks, original procedural starter sounds (four kits).
- Record microphone, import audio, trim with waveform handles, normalize selection, reverse selection, nondestructive slicing to empty pads, duplicate, mute, exclusive solo, stop selected sound.
- Three playback modes: one-shot, gated, toggled loop. Stereo audio and per-voice pitch, level, pan and attack/release.
- Eight loops, 1–4 bars. Step editing and live overdub, scale keyboard, metronome, count-in, swing, copy to next empty loop and queued loop launch.
- Global XY high/low-pass filter + reverb, tempo delay and saturation. Touch release resets XY unless held. These are independent DSP interpretations, not copied Koala/Circuit/Akai engines.
- Two effect slots per pad plus two Master slots, 31 advanced effect families and Ring Mod, explicit target, A/B and detailed parameters. Global XY remains an additional performance surface.
- Note repeat, choke groups, adjustable release, scale keyboard and worker-based time stretch (50–200%).
- Web MIDI input/output: ports, channels, velocity, bank/global pad mapping or chromatic selected sample, note-off, clock and transport. Clock follows tempo; it is not sample-accurate phase synchronization. Hardware support depends on the device/browser and adapter. Physical controllers have not been validated here.
- Undo/redo (8 states subject to memory budget), local autosave, JSON project import/export, stereo WAV loop export with current effects and tails, compressed performance recording (2 minutes maximum).
- Legacy Pocket Sample project import: first 64 pads, first 8 sequences, up to 4 bars. Advanced effects, automation, note-specific slice bounds and complex signatures are not migrated. Export a copy from the old app before importing.

## Limits / deliberate exclusions

This is a first playable redesign, not full MPC parity. No stem separation, native MIDI bridge or proprietary bank imports. This remains a web app, not a native APK/iOS build. Song arrangement, advanced automation and the complete archived MPC workflow are not restored. Effects gesture state is live, not saved as automation. Current editing features target a useful everyday subset. 60 seconds per sample, 240 seconds mono-equivalent PCM project capacity; generated original sounds are CC0 as in the source app. No external service or dependencies.

Use HTTPS for microphone and browser audio features. Physical mobile latency, multitouch behavior, OS file pickers and microphones still need testing on real Android/iPad devices. The cloud browser can validate UI, simulated interactions and rendered audio, not real device latency.

## Validation

`node tests/model.cjs` checks data validation, snapshots, chords, serialization and limited legacy migration. `tests/browser.js` is a manual browser test harness to temporarily load in a test copy; it restores the initial project and exercises real Web Audio, gating, slicing, undo, copying, effects rendering and IndexedDB. Do not include test harnesses in deployment.

Serve `dist/` using the managed Sites preview or any static HTTPS host. No build required.

V2 validation: model-fx, MIDI handler/ports simulation, LoFi DSP and WSOLA worker tests pass. Browser harnesses cover direct pad controls, inline editor, per-pad isolation, Master rendering/export, snapshots, MIDI roundtrip and finite/non-silent rendering of 30 advanced families. LoFi requires HTTPS; its numerical DSP test passes. Test harnesses are not shipped.

## V3 capture and usability
Direct Micro shortcut opens a focused take recorder: explicit permission/ready state, live input meter and peak warning, recording timer (59-second cap), stop, dry playback, retake, name and explicit destination/commit. The destination prefers an empty pad in the displayed bank. Takes remain outside the project until kept; replacement is labeled and undoable. Streams are released on stop/cancel/error, late permission responses are cleaned up. No live monitor to cause feedback. Backgrounding stops a recording into review when supported; it never silently commits it.
Notes recording is labeled separately. Mute/Solo labels are explicit; global Quitter solo is visible whenever solo is active. Pad hold no longer unexpectedly opens editing; Modifier remains explicit. Keyboard and step audition ignore grid action modes. FX bypass is labeled Avec/Sans effets and reset says Vider le rack.
`node tests/recorder.cjs` covers recorder lifecycle and races. `tests/record-browser.js` is a temporary manual harness using a synthetic microphone with real MediaRecorder/decoding; it verifies review, dry playback, no implicit replacement, cancellation, destination changes and undo. No harness ships in dist. Physical microphone quality/latency remains device testing.

## V4 restored creative tools
Sequence has Pas and Notes views of the same events, with a separate playable Clavier. Notes offers piano roll touch insertion, drag pitch/time, drag length handle, duration/velocity controls, copy/delete, grid/free placement, zoom, measure selection and follow playhead. Piano keys and MIDI melodic input are gated; captured note lengths and per-note gated durations are respected in live/offline rendering. Record quantization is stored in projects (free/1/8/1/16/1/32); partial-strength quantization edits only the selected pad track.
Loop tools: duplicate to an empty loop, double with note repetition up to four bars, halve, reverse selected track in time and render active loop including FX/tails to an empty sample pad. Original tracks remain. Sound edit adds stereo crop with undo and raw trimmed sample WAV export. Keyboard dialog has transport/REC controls.
Validation: `tests/note-tools.cjs` tests musical transforms and limits; temporary `tests/composition-browser.js` exercises touch insertion, drag, velocity/duration, copying/deleting, quantization, loop undo, audible gated duration, project validation, stereo crop/undo, resample preservation, WAV and keyboard release. Test assets do not ship. Portrait 360×640/390×844 and landscape 844×390 checked.
