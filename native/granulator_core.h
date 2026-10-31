#ifndef POCKET_GRANULATOR_CORE_H
#define POCKET_GRANULATOR_CORE_H
#include "grain_envelope.h"
#include "grain_spawn.h"
#include "grain_random.h"
#include "grain_mix.h"
#include "grain_schedule.h"
#ifdef __cplusplus
extern "C" {
#endif
/* Internal, sample-domain DSP assembly. Storage belongs to the caller and must
   outlive the core. This is not yet a host/plugin or an untrusted-input API.
   Grain capacity and sample rate mapping are host responsibilities. */
typedef struct {
    PocketGrainControls controls;
    PocketGrainMix mix;
    PocketGrainSchedule schedule;
    uint64_t random_state;
    PocketSpawnedGrain* grains;
    unsigned grain_count, grain_capacity;
    float envelope[256];
    float *capture_left, *capture_right, *ring_left, *ring_right;
    float *scratch_left, *scratch_right;
    unsigned max_frames;
    float envelope_amount, envelope_shape;
    int envelope_dirty, freeze_requested;
} PocketGranulatorCore;
/* Caller provides four initialized ring_length arrays (zero for empty history),
   two max_frames scratch arrays and capacity grains. No allocation or I/O. */
void pocket_granulator_init(PocketGranulatorCore*, PocketSpawnedGrain*, unsigned,
    float*, float*, float*, float*, unsigned, float*, float*, unsigned, uint64_t);
/* Stereo in-place processing. frames <= max_frames; ring length > 1;
   duration >= 1; countdown >= 0; interval >= 1; normalized spreads, wet mix
   and envelope controls; finite audio/controls; positive representable
   envelope_rate with every active envelope index <= 254; grain reader's
   address/cast constraints also apply. No overlapping arrays. Thread confined.
   Changes to envelope_amount/shape require envelope_dirty = 1. Set
   freeze_requested rather than writing controls.frozen or mix.frozen.
   A full grain pool suppresses spawning, matching the observed scheduler.
   This preserves the observed one-spawn-per-host-block scheduling; arbitrary
   changes of block size are not claimed to be sonically equivalent. */
int pocket_granulator_process(PocketGranulatorCore*, float*, float*, unsigned);
#ifdef __cplusplus
}
#endif
#endif
