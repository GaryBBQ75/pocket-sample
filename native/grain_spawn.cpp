#include "grain_spawn.h"
#include <cmath>
extern "C" void pocket_spawn_grain(const PocketGrainControls* c,
 float random_pan,float random_speed,float random_position,PocketSpawnedGrain* result) {
 const float pan = std::fma(random_pan,c->stereo_spread,(1.0f-c->stereo_spread)*0.5f);
 const float low = std::fma(-random_speed,c->speed_spread,1.0f);
 float speed = std::fma(random_speed,c->speed_spread,c->base_speed*low);
 const float span = std::fma(c->position_spread,0x1.f5c29p-2f,0x1.47ae14p-7f);
 const float delay = std::fma(static_cast<float>(c->buffer_length)*span,random_position,1.0f);
 float position = static_cast<float>(c->frozen ? c->frozen_position : c->write_position) - delay;
 if(c->reverse) speed=-speed;
 else position=std::fma(-speed,c->duration_samples,position);
 const float other = 1.0f-pan;
 result->cursor.position=static_cast<int64_t>(position*0x1p32f);
 result->cursor.step=static_cast<int64_t>(speed*0x1p32f);
 result->cursor.envelope_position=0;
 result->cursor.envelope_step=static_cast<uint64_t>((c->envelope_rate*254.0f)*0x1p32f);
 result->cursor.left_gain=(other*0.5f)*std::fma(-other,other,3.0f);
 result->cursor.right_gain=(pan*0.5f)*std::fma(-pan,pan,3.0f);
 result->remaining_samples=static_cast<int32_t>(c->duration_samples);
}
