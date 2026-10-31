# Effects usability and audio validation — version 08

The published v07 was exercised through browser WAV exports of the same beat and settings. Dry RMS was 0.08316; granulator RMS was 0.06126, with dry/wet difference RMS 0.08211. No PCM clipping was measured in either case. This establishes signal transformation for the tested audio, not perceptual quality or MPC equivalence.

Stereo Sample Delay at 0/0 ms had no material signal change. With L=0 and R=250 ms, the right channel matched the source shifted by 11,025 samples at 44.1 kHz, with RMS error about 1.65e-7 after the initialization transition. This is a per-channel offset, not a repeating echo.

Version 08 changes the explanatory UI and adds an isolated looping preview that leaves user pads/patterns unchanged, three grain presets, stereo-offset presets, temporary A/B bypass, effect reset, an engine-ready handshake, explicit error fallback to dry audio and RMS/peak feedback from the live worklet. The original C++ DSP is unchanged.

`node tests/effects-worklet.mjs` instantiates the actual browser worklet class with the compiled WASM engine and checks ready, bypass, changed audio, signal meters, nonzero frozen captured audio, reset and finite output at selected extreme parameter combinations. Existing sampler regression and WAV worker tests continue to pass.

This is numerical and browser UI validation; no claim is made of physical-phone audio testing or a human listening evaluation. High feedback/wet/density settings can change level substantially; no hidden auto-normalization or replacement DSP was added. The Signal Delay UI explicitly explains that 0/0 is neutral and that stereo width is easier to perceive on headphones.
