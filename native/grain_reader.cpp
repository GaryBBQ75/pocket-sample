#include "grain_reader.h"
#include <cmath>
extern "C" void pocket_read_grain(PocketGrainCursor* cursor,
 const float* left, const float* right, unsigned length,
 const float* window, float* output_left, float* output_right, unsigned frames) {
    constexpr float unit = 0x1p-32f;
    const int64_t extent = static_cast<int64_t>(length) << 32;
    for (unsigned frame = 0; frame < frames; ++frame) {
        const unsigned envelope_index = cursor->envelope_position >> 32;
        const float envelope_fraction = static_cast<float>(static_cast<uint32_t>(cursor->envelope_position)) * unit;
        const float amplitude = std::fma(envelope_fraction,
            window[envelope_index + 1] - window[envelope_index], window[envelope_index]);
        int64_t address = cursor->position;
        if (address < 0) address += static_cast<int64_t>(static_cast<float>(length - 1) * 0x1p32f);
        else if (address >= extent) address -= static_cast<int64_t>(static_cast<float>(length) * 0x1p32f);
        const unsigned first = static_cast<uint64_t>(address) >> 32;
        const unsigned second = first + 1 < length ? first + 1 : first + 1 - length;
        const float fraction = static_cast<float>(static_cast<uint32_t>(address)) * unit;
        const float l = std::fma(fraction, left[second] - left[first], left[first]);
        const float r = std::fma(fraction, right[second] - right[first], right[first]);
        output_left[frame] = std::fma(amplitude * l, cursor->left_gain, output_left[frame]);
        output_right[frame] = std::fma(amplitude * r, cursor->right_gain, output_right[frame]);
        cursor->position += cursor->step;
        cursor->envelope_position += cursor->envelope_step;
    }
}
