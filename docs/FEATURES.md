# Pocket Sample — web instrument 07

## Delivered in this version

- A persistent selected-pad strip provides a sample selector that never triggers sound, Stop This Pad and Mute/Unmute.
- Per-pad voice identity lets Stop This Pad stop only that pad's active and already-scheduled voices. The sequencer continues and can trigger the pad on its next event; Mute blocks those future events and direct pad hits. Global effects have shared state and may retain a tail after stopping/muting a source. No per-pad effect-tail isolation is claimed.
- Eight banks A–H (128 sample slots). Empty slots allocate only a single silent float. Existing 16-pad projects migrate without replacing their samples.
- One Shot, held Note On with release, toggle looping and an independent loop-start parameter. Mono/poly retrigger behavior, pan, fine tuning, attack and release, filter type and resonance are editable.
- 16 Levels for pitch, volume and cutoff, and tempo-synchronized note repeat including triplets. 16 Levels is a live performance mode: its per-hit variations are not recorded into the current Boolean step sequencer. The grid stores one event per step; this is not MPC's event engine.
- Tap tempo, click and count-in; four independent one-bar patterns with swing. Song mode arranges A–D in an order of up to 64 one-bar entries, with optional looping. WAV export supports the active pattern or one song pass.
- Internal mix recording through MediaStreamDestination/MediaRecorder, including global effects and master output, to the next empty pad. Format and codec depend on browser support; this is not a bit-exact uncompressed resampling path. The browser UI capture was exercised and decoded successfully into B01.
- Nondestructive trim markers and zoom; crop, normalization, reverse and trimmed raw sample WAV export. Undo/redo cover supported edits. Project files and IndexedDB retain the new sample fields, banks, patterns and song order.
- Existing reconstructed C++ granulator and stereo delay are unchanged. The new Web Audio sample controls and sequencing functions are independent implementations; they are not conversions of Akai firmware.

## Resource bounds

Live playback caches AudioBuffers, limits active sample voices to 32 and disconnects ended nodes. The existing effects load only on activation. Export DSP and WAV encoding run in a dedicated worker. Sample imports accept up to 32 MiB / 60 seconds; the project allows at most 240 seconds of mono-equivalent audio (stereo counts twice). Mix capture stops at 59 seconds. WAV rendering is limited to 60 seconds, plus a two-second tail. Session history retains at most eight snapshots, with a sample-memory budget. Browser-local retention can fail in private/full storage; downloadable project files remain available.

## Validation

`node tests/web-regression.cjs`: stereo slices, undo/redo, bank migration and project roundtrips, malformed audio rejection, buffer cache reuse, mute/solo eligibility, isolated pad stopping, looping and gate release.

`node tests/worker-dsp.mjs`: stereo PCM/WAV worker matches direct WASM DSP results, including effects and master gain.

Browser UI checks: sample selection/stop/mute, loop selection, WAV download (2 channels, 44.1 kHz, nonzero PCM), internal mix capture and automatic placement on B01. Responsive layout checked using a 390px embedded viewport. No physical Android/iOS device test. Production is private; full deployed-browser testing requires its authenticated owner session.

## Outstanding relative to an exact MPC Sample reproduction

- Other original FX, Flex Beat, Color Compressor, complete per-pad routing and automation.
- The original sample engine, original filter/envelope curves, warp/time-stretch and bit-exact end-to-end audio behavior.
- Original sequence/event editing (note durations, per-event velocities and parameters, timing resolution), full original sequence capacity and original Song Mode semantics.
- MIDI mapping/clock, retrospective sample/sequence recall, original kit/content browser and native Akai project interoperability.
- Full native mobile application packaging with this studio workflow. The linked APK remains the prior DSP laboratory, not the web studio.

These require further implementation and reference validation; this release does not finish the full MPC conversion.
