#ifndef POCKET_GRAIN_PARAMETERS_H
#define POCKET_GRAIN_PARAMETERS_H
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
/* Observed display conversions, input normalized to [0,1]. Names follow the
   original parameter labels. No clamp/curve/automation layer is implied. */
float pocket_grain_window_milliseconds(float normalized);
float pocket_grain_length_milliseconds(float normalized);
/* Original percentage callbacks multiply their physical 0..100 input by .01.
   Shared by trigger/pitch randomization, stereo spread, feedback and wet mix. */
float pocket_grain_percent(float percent);
typedef struct {
    float duration_samples, envelope_rate;
    int32_t trigger_interval;
} PocketGrainTiming;
/* Reconstructs the physical-unit callback arithmetic. Returns 0 without writing
   out for null, nonfinite, nonpositive or unrepresentable inputs/results.
   Does not resize/reset buffers or validate the core's grain address bounds.
   On success copy fields into controls.duration_samples, controls.envelope_rate
   and schedule.interval respectively, on the audio thread between blocks. */
int pocket_grain_timing(float sample_rate,float grain_milliseconds,
                       float grains_per_second,PocketGrainTiming* out);
typedef struct { float octave_exponent, speed; } PocketGrainPitch;
/* Physical pitch conversion: (semitones + cents * .01) / 12, then powf(2,x).
   Rejects invalid/nonpositive/nonfinite results without writing out.
   The platform math library participates in the final rounding. Validate each
   target before claiming cross-platform bit identity. Grain address bounds
   still apply when the speed is passed into controls.base_speed. */
int pocket_grain_pitch(float semitones,float cents,PocketGrainPitch* out);
#ifdef __cplusplus
}
#endif
#endif
