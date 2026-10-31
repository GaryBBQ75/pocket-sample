#ifndef POCKET_GRAIN_RANDOM_H
#define POCKET_GRAIN_RANDOM_H
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
/* Reconstructs only the already-initialized arithmetic path.
   Startup seeding and thread-local stream ownership remain separate. */
float pocket_seeded_random(uint64_t* state);
#ifdef __cplusplus
}
#endif
#endif
