# Pocket Sample 11 — continued functional implementation

See OPTION-COVERAGE.md for the manual-based coverage inventory. This is still not an integral or sonically identical MPC Sample replica. No original factory sounds, firmware, licensed Flex Beat presets or proprietary DSP are embedded.

## Added

- 1–128 bars per sequence, still sparse storage, five time signatures (including a 20-step 5/4 grid), global/per-sequence tempo. Song playback/export preserve variable tempos. Continue resumes the saved transport position. Per-pad step resolution is still 1/16 with timing offsets and one event per position.
- Independent complementary FX settings per pad, cached graph per used pad/context, before the common assigned native/complementary rack. Changing a pad preserves all other pads' FX settings. Graphs reset/dispose on project restore, panic and pad stop. The common rack still retains its global/single/group routing.
- Automation for pitch, volume, pan and filter, recorded with REC + Automation Rec. Step changes affect already sounding voices and new events in live/offline rendering. Snapshots, copy, resizing and song merging preserve independent automation data. Other automation targets remain absent.
- Choke groups, same-bank pad linking (one additional trigger, no recursion), trigger offset, loop lock, velocity sensitivity, amplitude decay and filter-envelope attack/decay/depth; independent curves, no original filter model claim.
- Assignable fader, destructive Time Correct with undo and collision rule, note half/double speed, sequence render into an empty pad, song merging to an empty sequence (bounded 128 bars; differing tempos require WAV instead).
- Separate global output compressor with attack/release/amount/input boost/color, present in playback, mix capture and offline export. Independent algorithm and automatic makeup approximation.
- Independent 16-pattern temporal remix engine: repeats, reverse, half/double, scratches, gates, tape stop and chops; mix, one-shot/loop, quantized launch. Lazy AudioWorklet with ready handshake and dry-output fallback; same core processes offline output. Export warms the capture using the opening bar before applying the selected pattern; this is a deterministic preset render, not an event recording of a live Flex performance. Temporal presets do not claim to reproduce Akai's Flex Beat library.
- Explicitly armed stereo 25-second rolling audio recall. Select exposed audio input device, stereo/L/R extraction, optional monitoring, retrieve to an empty pad. Disabled on background/page hide/project restore. No microphone activation on load. Native context-rate audio is resampled to 44.1 kHz before committing; stale captures/project changes are rejected. Actual microphone hardware not tested here.
- MIDI output notes, channels, empty-pad-only routing, Program Change sequence selection, MIDI Thru, 24 PPQN output and incoming clock tempo estimation with Start/Continue/Stop. Incoming clock is tempo/transport following, not a sample-accurate external phase lock. MTC and CV are absent. Hardware MIDI remains untested.
- Advanced nondestructive slice preparation: regions, transient detection, manual tap markers, audition, boundary editing, split/merge, extraction/distribution into empty pads. Original audio retained; memory bounds and undo.
- Mute grid mode and an in-app option-coverage table.

## Validation

- Web regressions cover earlier features plus 128-bar serialization, event 2047, 5/4 step 40, automation snapshot independence/persistence, individual FX settings, choke/link, MIDI messages/channel/clock tempo and slice split/merge.
- Temporal core: all 15 active patterns produce finite, changed output and preserve stereo antiphase; neutral is exact. One-shot returns to neutral.
- Rolling recall worklet: 30 seconds of synthetic stereo input produces the exact last 25 seconds in chronological order after ring wrap. Output is silent while storing input.
- Real browser OfflineAudioContext integration: 5/4 export 198,450 frames; automation silences the latter sustained-note interval exactly; individual distortion and temporal gate measurably change output; 120/60 BPM song renders 352,800 frames with tail.
- Existing native DSP worker/worklet and stretch suites remain passing.

No physical phone, MIDI device or microphone recording validation is claimed. Memory limits remain 240 mono-equivalent sample seconds and 60 seconds per offline export. Advanced sections remain collapsed; no external runtime libraries were added.
