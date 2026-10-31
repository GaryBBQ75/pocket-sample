#ifndef POCKET_GRAIN_SPAWN_H
#define POCKET_GRAIN_SPAWN_H
#include "grain_reader.h"
#ifdef __cplusplus
extern "C" {
#endif
typedef struct {
 float stereo_spread, speed_spread, base_speed, position_spread;
 float duration_samples, envelope_rate;
 int32_t buffer_length, write_position, frozen_position;
 int32_t frozen, reverse;
} PocketGrainControls;
typedef struct { PocketGrainCursor cursor; int32_t remaining_samples; } PocketSpawnedGrain;
/* Random draws are supplied by caller; PRNG and grain scheduling are separate.
   Finite controls and ranges that keep fixed-point casts representable required. */
void pocket_spawn_grain(const PocketGrainControls*,float,float,float,PocketSpawnedGrain*);
#ifdef __cplusplus
}
#endif
#endif
