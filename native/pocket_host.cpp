#include "pocket_host.h"
#include "granulator_core.h"
#include "grain_parameters.h"
#include "sample_delay.h"
#include <algorithm>
#include <cmath>
#include <new>
#include <vector>
namespace {
struct Host {
    float rate;
    std::vector<float> capture_l,capture_r,ring_l,ring_r;
    std::vector<float> delay_l,delay_r;
    PocketSampleDelay delay;
    bool granulator_enabled=true,delay_enabled=false;
    float left[128]{},right[128]{},scratch_l[128]{},scratch_r[128]{};
    PocketSpawnedGrain pool[128]{};
    PocketGranulatorCore core;
    explicit Host(float sr):rate(sr),capture_l(static_cast<unsigned>(sr*2.06f)),
      capture_r(capture_l.size()),ring_l(capture_l.size()),ring_r(capture_l.size()),
      delay_l(static_cast<unsigned>(sr*.25f)+1),delay_r(delay_l.size()) {
        pocket_granulator_init(&core,pool,128,capture_l.data(),capture_r.data(),
          ring_l.data(),ring_r.data(),ring_l.size(),scratch_l,scratch_r,128,17);
        core.mix.dc_coefficient=static_cast<float>(std::exp(-6.283185307179586*10.0/sr));
        core.envelope_amount=.45f;
        pocket_sample_delay_init(&delay,sr,delay_l.data(),delay_r.data(),delay_l.size());
    }
};
bool finite(float value,float lo,float hi){return std::isfinite(value)&&value>=lo&&value<=hi;}
}
extern "C" void* pocket_host_create(float rate) {
    if(!finite(rate,8000,192000))return nullptr;
    return new(std::nothrow) Host(rate);
}
extern "C" void pocket_host_destroy(void* raw){delete static_cast<Host*>(raw);}
extern "C" int pocket_host_configure(void* raw,float duration,float density,float pitch,
    float window,float stereo,float feedback,float wet,int freeze,int reverse) {
    if(!raw||!finite(duration,10,200)||!finite(density,1,300)||!finite(pitch,-12,12)||
       !finite(window,0,1)||!finite(stereo,0,1)||!finite(feedback,0,1.f)||
       !finite(wet,0,1))return 0;
    auto& h=*static_cast<Host*>(raw);PocketGrainTiming timing;PocketGrainPitch tuning;
    if(!pocket_grain_timing(h.rate,duration,density,&timing)||
       !pocket_grain_pitch(pitch,0,&tuning))return 0;
    h.core.controls.duration_samples=timing.duration_samples;
    h.core.controls.envelope_rate=timing.envelope_rate;
    h.core.controls.base_speed=tuning.speed;
    h.core.controls.position_spread=window;h.core.controls.stereo_spread=stereo;
    h.core.controls.speed_spread=0;h.core.schedule.interval=timing.trigger_interval;
    h.core.schedule.interval_spread=.15f;h.core.mix.feedback=feedback;
    h.core.mix.wet_mix=wet;h.core.freeze_requested=freeze?1:0;
    h.core.controls.reverse=reverse?1:0;return 1;
}
extern "C" int pocket_host_process(void* raw,float* data,unsigned frames) {
    if(!raw||!data||frames>128)return 0;
    auto& h=*static_cast<Host*>(raw);
    for(unsigned i=0;i<frames;++i){h.left[i]=data[i*2];h.right[i]=data[i*2+1];}
    if(!pocket_granulator_process(&h.core,h.left,h.right,frames))return 0;
    if(!h.granulator_enabled)for(unsigned i=0;i<frames;++i){h.left[i]=data[i*2];h.right[i]=data[i*2+1];}
    if(h.delay_enabled)pocket_sample_delay_process(&h.delay,h.left,h.right,frames);
    for(unsigned i=0;i<frames;++i){data[i*2]=h.left[i];data[i*2+1]=h.right[i];}
    return 1;
}
extern "C" int pocket_host_set_effects(void* raw,int granulator,int delay) {
    if(!raw)return 0;auto& h=*static_cast<Host*>(raw);
    h.granulator_enabled=granulator!=0;h.delay_enabled=delay!=0;return 1;
}
extern "C" int pocket_host_set_delay(void* raw,float left,float right) {
    if(!raw||!finite(left,0,250)||!finite(right,0,250))return 0;
    auto& h=*static_cast<Host*>(raw);
    return pocket_sample_delay_set(&h.delay,left/250.f,right/250.f);
}
