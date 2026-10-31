# Pocket Sample — DSP shared core

The reconstructed granulator and stereo Sample Delay are integrated into the existing browser sampler as global stereo effects. Pads, sample chopping and sequencing use the existing Web Audio implementation; they are not reconstructions of the full MPC engine. C++ core source contains no original firmware or factory samples.

Validation so far: original AArch64 reference oracle matches 2,400 finite stereo blocks and compared internal states; physical timing/percentage conversions match 10,050 scalar fields; pitch matches 10,008 finite cases against the supplied reference AArch64 libm. Native Linux host vs WebAssembly host matches 102,400 float values across 400 blocks with duration/pitch/freeze/reverse changes. These are finite test results, not a full MPC equivalence or hardware sound comparison.

Browser compilation: Emscripten 6.0.13, C++17, O2, fno-fast-math, ffp-contract=off. Browser processing uses 128-frame Web Audio blocks; the observed scheduling algorithm depends on host block size. OS seeding, full parameter/UI curves, all other effects and sample playback engine remain outside this reconstruction. The host initialization and bounded UI are integration choices, not a verified recreation of every device default.

Android test APK: native ARM64 C++ via JNI and AudioTrack, API 26 minimum / API 35 target. Four procedural test sounds and grain and stereo delay controls. It does not contain the browser sampler's full pads/import/project workflow. Built using NDK r28c and build tools 35.0.0; debug APK signature verified (v2/v3) and alignment checked. No physical-device or emulator audio test performed. Debug signing is for this test build, not a Play Store release.

iOS has not been built. Desktop-browser delivery and Android test build do not complete the entire MPC conversion.

Build Android with `python android/build.py --ndk NDK_PATH --platform ANDROID_JAR --tools BUILD_TOOLS_DIR`. Standard JDK 17, Android NDK and platform/build tools required. Generated build files and test key are ignored by Git.

Official build/audio documentation: https://developer.android.com/ndk/guides/cmake and https://developer.android.com/reference/android/media/AudioTrack ; compiler setup: https://emscripten.org/docs/getting_started/downloads.html .

Sample Delay: 1,600 reference blocks / 114,240 audio float values match bitwise, along with rings and compared state. Test includes per-channel changes, crossfades, deferred requests, zero delay, maximum delay and wrapping. Parameter reads and framework bookkeeping are stubbed in the oracle; allocation and UI link/automation behavior are not claimed. Combined granulator/delay pipeline vs WebAssembly also matches 102,400 floats over 400 blocks.
