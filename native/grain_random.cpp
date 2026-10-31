#include "grain_random.h"
extern "C" float pocket_seeded_random(uint64_t* state) {
    *state = (*state * uint64_t{48271}) & uint64_t{0x7fffff};
    return static_cast<float>(*state) * 0x1.000002p-23f;
}
