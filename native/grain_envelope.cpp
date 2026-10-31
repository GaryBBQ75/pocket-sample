#include "grain_envelope.h"
#include <cmath>
extern "C" void pocket_grain_envelope(float amount, float skew, float* output) {
    const float gain = std::fma(amount, 9.0f, 1.0f);
    const float step = 0x1.020408p-8f;
    for (int index = 0; index < 256; ++index) {
        const float position = static_cast<float>(index) * step;
        const float rising = (1.0f - skew) * position;
        const float curvature = rising * (2.0f - position);
        const float phase = std::fma(skew * position, position, curvature);
        const float window = (1.0f - phase) * (phase * 4.0f);
        const float amplitude = (window * window) * gain;
        output[index] = amplitude > 1.0f ? 1.0f : amplitude;
    }
    output[255] = 0.0f;
}
