#ifndef POCKET_GRAIN_READER_H
#define POCKET_GRAIN_READER_H
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
typedef struct {
    int64_t position, step;
    uint64_t envelope_position, envelope_step;
    float left_gain, right_gain;
} PocketGrainCursor;
/* Internal primitive. Buffers/envelope must be valid; caller guarantees all
   addressed indices are in bounds, no signed overflow, and at most one wrap
   per sample. This does not schedule grains, apply feedback or mix dry audio. */
void pocket_read_grain(PocketGrainCursor*, const float*, const float*, unsigned,
                       const float*, float*, float*, unsigned);
#ifdef __cplusplus
}
#endif
#endif
