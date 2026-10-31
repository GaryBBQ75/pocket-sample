#include "grain_parameters.h"
#include <cmath>
extern "C" float pocket_grain_window_milliseconds(float normalized) {
    const float span=std::fma(normalized,0x1.f5c29p-2f,0x1.47ae14p-7f);
    const float doubled=span+span;
    return doubled*1000.0f;
}
extern "C" float pocket_grain_length_milliseconds(float normalized) {
    return std::fma(normalized,190.0f,10.0f);
}
extern "C" float pocket_grain_percent(float percent) {
    return percent*0x1.47ae14p-7f;
}
extern "C" int pocket_grain_timing(float sample_rate,float milliseconds,
    float grains_per_second,PocketGrainTiming* out) {
    if(!out||!std::isfinite(sample_rate)||!std::isfinite(milliseconds)||
       !std::isfinite(grains_per_second)||sample_rate<=0||milliseconds<=0||
       grains_per_second<=0) return 0;
    const float per_millisecond=sample_rate*0x1.0624dep-10f;
    const float duration=per_millisecond*milliseconds;
    const float interval=sample_rate/grains_per_second;
    if(!std::isfinite(duration)||!std::isfinite(interval)||
       duration<1.0f||duration>=0x1p31f||interval<1.0f||interval>=0x1p31f)return 0;
    out->duration_samples=duration;
    out->envelope_rate=1.0f/duration;
    out->trigger_interval=static_cast<int32_t>(interval);
    return 1;
}
extern "C" int pocket_grain_pitch(float semitones,float cents,PocketGrainPitch* out) {
    if(!out||!std::isfinite(semitones)||!std::isfinite(cents))return 0;
    const float exponent=std::fma(cents,0x1.47ae14p-7f,semitones)/12.0f;
    if(!std::isfinite(exponent))return 0;
    const float speed=std::pow(2.0f,exponent);
    if(!std::isfinite(speed)||speed<=0.0f)return 0;
    out->octave_exponent=exponent;out->speed=speed;
    return 1;
}
