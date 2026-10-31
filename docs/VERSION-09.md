# Pocket Sample 09 — implemented scope and remaining work

## Changes

The existing native granulator and sample delay, followed by one independent Web Audio effect, form a common rack. It can be assigned to all pads, a fixed single pad, or an explicit multi-bank set. Non-target pads have a separate dry path to the master. Assignments are stable when the selected pad changes, are stored in project files/IndexedDB, and are undoable. This is not an independent full rack for every pad; selected group members share the same settings and effect buffers. Stopping the sole target clears its effect memories; in shared mode one member's existing tail cannot be separated from the combined buffer.

New complementary effects: echo, reverb, chorus, flanger, phaser, ring modulation, LP/HP/BP filters, saturation, bitcrush and compressor. These are independent Web Audio implementations, not conversions or proven sonic matches to Akai algorithms. Native C++ core and its finite reference comparisons are unchanged.

128 sequence slots are stored sparsely. Each remains one 16-step bar with at most one event per pad/step. Events retain velocity, pitch offset, duration (for held playback), filter variation and timing offset. 16 Levels variations and played MIDI velocities can be recorded. Note Repeat values finer than this grid can replace events in a step. Song order accepts A–D or numbered slots 1–128, with up to 64 entries. These limitations differ from the original event engine.

MIDI input is available through browser Web MIDI with explicit user permission, without SysEx: notes 36–51 trigger the current bank and note-offs release held notes. No hardware MIDI test, external clock, output mapping or native iOS MIDI implementation is claimed.

New Project starts empty and can be undone in the current page. Half/double-speed shortcuts affect pitch and playback rate together; they are not time-stretch. Stereo samples now display separate L/R waveforms.

Export renders four isolated stem channels (rack targets and clean pads), applies native DSP only to rack targets, then the complementary effect, mixes clean pads and applies master volume. Native PCM worker mode avoids intermediate WAV quantization and allocation. Existing duration/memory limits and lazy buffer caching remain. Audio is suspended in the background.

## Validation

- `tests/web-regression.cjs`: migration of legacy projects, sparse sequence 128, per-event roundtrip, routing assignment/gain isolation, new-project undo, existing recording/playback behavior and buffer caching.
- `tests/worker-dsp.mjs`: final WAV and new float PCM mode both match direct WASM processing for tested samples.
- `tests/effects-worklet.mjs`: native worklet readiness, bypass, meters, freeze and tested extremes.
- `tests/browser-audio-harness.js`: real OfflineAudioContext tests for all 12 complementary types, finite/changing output, exact bypass. Shared-rack isolation test max float error 1.49e-8.
- `tests/export-routing-browser.js`: actual application `renderMix()` checked with a compressor and native granulator assigned to only A01. Non-assigned output max error was **0** in both tests; assigned compressor output differed by RMS ~0.08708. The temporary test UI is excluded from publication.

## Still missing for the original goal

Full original Flex Beat/Pad FX/Knob FX algorithms and automation, verified original filter/envelope behavior, the original warp/time-stretch engine, retrospective sample/sequence recall, full-resolution multi-event/multi-bar sequence semantics, original project/kit interoperability, MIDI clock/output and complete native Android/iOS builds. The linked APK is still the previous DSP test application. These are substantial remaining components; this version is not a completed or bit-exact MPC Sample replica.
