#include "granulator_core.h"
#include <algorithm>

extern "C" void pocket_granulator_init(PocketGranulatorCore* s,
    PocketSpawnedGrain* grains, unsigned capacity,
    float* capture_left, float* capture_right, float* ring_left, float* ring_right,
    unsigned ring_length, float* scratch_left, float* scratch_right,
    unsigned max_frames, uint64_t seed) {
    *s = PocketGranulatorCore{};
    s->grains=grains; s->grain_capacity=capacity; s->max_frames=max_frames;
    s->capture_left=capture_left; s->capture_right=capture_right;
    s->ring_left=ring_left; s->ring_right=ring_right;
    s->scratch_left=scratch_left; s->scratch_right=scratch_right;
    s->controls.buffer_length=static_cast<int32_t>(ring_length);
    s->controls.base_speed=1.0f; s->controls.duration_samples=64.0f;
    s->controls.envelope_rate=1.0f/64.0f;
    s->schedule.interval=64; s->schedule.channels=2;
    s->random_state=seed; s->mix.wet_mix=1.0f;
    s->envelope_shape=0.5f; s->envelope_dirty=1;
}

struct Context { PocketGranulatorCore* s; float* left; float* right; };
static void process_span(void* raw, int offset, int frames) {
    auto& c=*static_cast<Context*>(raw); auto& s=*c.s;
    if(s.envelope_dirty) {
        pocket_grain_envelope(s.envelope_amount,s.envelope_shape,s.envelope);
        s.envelope_dirty=0;
    }
    if(s.controls.frozen!=s.freeze_requested) {
        s.controls.frozen_position=static_cast<int32_t>(s.mix.write_position);
        s.controls.frozen=s.freeze_requested;
    }
    s.mix.frozen=s.controls.frozen;
    std::fill_n(s.scratch_left,frames,0.0f);
    std::fill_n(s.scratch_right,frames,0.0f);
    unsigned index=0;
    while(index<s.grain_count) {
        auto& g=s.grains[index];
        const int count=std::min(frames,g.remaining_samples);
        if(count>0) pocket_read_grain(&g.cursor,s.ring_left,s.ring_right,
            static_cast<unsigned>(s.controls.buffer_length),s.envelope,
            s.scratch_left,s.scratch_right,static_cast<unsigned>(count));
        g.remaining_samples-=count;
        if(g.remaining_samples==0) s.grains[index]=s.grains[--s.grain_count];
        else ++index;
    }
    pocket_mix_grains(&s.mix,c.left+offset,c.right+offset,
        s.scratch_left,s.scratch_right,s.capture_left,s.capture_right,
        s.ring_left,s.ring_right,static_cast<unsigned>(s.controls.buffer_length),
        static_cast<unsigned>(frames));
    s.controls.write_position=static_cast<int32_t>(s.mix.write_position);
}
static float draw(void* raw) {
    auto& s=*static_cast<Context*>(raw)->s;
    return pocket_seeded_random(&s.random_state);
}
static void try_spawn(void* raw) {
    auto& s=*static_cast<Context*>(raw)->s;
    if(s.grain_count>=s.grain_capacity) return;
    const float pan=draw(raw), speed=draw(raw), position=draw(raw);
    pocket_spawn_grain(&s.controls,pan,speed,position,&s.grains[s.grain_count++]);
}
extern "C" int pocket_granulator_process(PocketGranulatorCore* s,
    float* left,float* right,unsigned frames) {
    if(!s||!left||!right||frames>s->max_frames||s->schedule.countdown<0||
       s->schedule.interval<1||s->controls.buffer_length<2) return 0;
    Context c{s,left,right};
    pocket_schedule_grains(&s->schedule,static_cast<int>(frames),&c,
        process_span,try_spawn,draw);
    return 1;
}
