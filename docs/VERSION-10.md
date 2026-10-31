# Pocket Sample 10

This release continues the functional recreation. It is not the integral MPC Sample implementation or a sonic match to all original algorithms.

## Implemented

- Each of 128 sequences has 1–8 bars of 16 steps. The mobile grid displays one bar with previous/next controls and follows playback. Song playback and WAV export use each sequence's complete length. Pattern export repeats the whole sequence. Existing versions 1–6 migrate to one bar; project format is now 7.
- Double sequence repeats all tracks and their event parameters; half truncates trailing bars. Copy preserves sequence length and per-event parameters. All operations support undo. Clearing a track removes its event data as well as its active steps.
- Retrospective note recall remembers up to 2,048 pad/sequence/step positions played during the current transport session, including velocity, pitch, filter, timing and held duration, even without REC. Stop and choose Recover Play to merge these notes into the current sequence. Repeated notes at one position replace previous recall notes. Starting playback, loading a project, resizing a sequence or creating a project resets temporary recall. This is note recall, not retrospective microphone/audio recall, and is still limited to one event per pad per step.
- Offline pitch-preserving sample stretch, mono/stereo, source/target BPM, ratio 0.5–2, 80 ms minimum input, 60 sec maximum output. Independent WSOLA-style overlap matching, not Akai's Warp engine. Both channels share one alignment chosen using the higher-energy channel. It processes the trimmed selection in a dedicated, disposable Web Worker and writes the result into the pad only when complete. Playback remains cheap after processing; no library/runtime is added. Undo restores the original. Cancel terminates the worker. Concurrent sample edits or project replacement discard stale results. Stereo/overall sample memory limits still apply.

Algorithm background: Roelands and Verhelst, 1993, https://www.isca-archive.org/eurospeech_1993/roelands93_eurospeech.html . This is an independent implementation; no original implementation code was copied.

## Validation

- Web regressions: multi-bar copy/duplicate, independent event edits in bar 2, project roundtrip, truncation undo, variable song offsets, retrospective recall without REC, recall undo and end-of-sequence wrap. Existing slicing, mute, routing and project tests still pass.
- Worker audio checks: 440 Hz tone remains within 3 Hz at ratios 0.5, 0.75, 1, 1.25, 1.5 and 2; exact output lengths; antiphase stereo stays aligned; finite output, silence, unity identity, invalid signals/bounds.
- Real browser OfflineAudioContext integration: a note at step 21 sounds at 2.5 s at 120 BPM, with zero peak before 2.49 s. Two-bar pattern export is 264,600 frames including 2 s tail. A two-bar + three-bar song is 529,200 frames including tail. Actual browser stretch worker returns 66,150 finite frames for a 44,100-frame input at ratio 1.5.
- Native worker/worklet tests remain passing; those engines are unchanged.

Synthetic frequency checks do not establish perceptual transparency. Transients and dense polyphonic material can produce stretching artifacts. Physical phone CPU/memory behavior and hardware MIDI remain unverified.

## Still missing for the full original goal

Full Flex Beat/Pad FX/Knob FX algorithms and automation, independent full rack settings per pad, sample/audio recall, higher-resolution multiple-event sequencing, original Akai Warp/filter/envelope equivalence, original kit/project compatibility, MIDI clock/output and complete native mobile studio. The Android APK remains the older DSP lab. These are not silently marked complete by the new note recall and independent stretch implementation.
