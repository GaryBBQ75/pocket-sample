#include "grain_mix.h"
#include <cmath>
static float ring_value(float raw,float wet,float feedback,float coefficient,float& low) {
    const float combined=std::fma(feedback,wet,raw);
    const float difference=low-combined;
    float next=std::fma(difference,coefficient,combined);
    next=next+1.000000045813705e-18f;
    next=next-1.000000045813705e-18f;
    float high=combined-next;
    low=next;
    high=std::fmax(-1.5f,high);
    high=std::fmin(1.5f,high);
    const float square=high*high;
    const float correction=high*(-0.14814814925193787f);
    return std::fma(correction,square,high);
}
extern "C" void pocket_mix_grains(PocketGrainMix* s,
 float* dry_left,float* dry_right,const float* wet_left,const float* wet_right,
 float* capture_left,float* capture_right,float* ring_left,float* ring_right,
 unsigned ring_length,unsigned frames) {
 for(unsigned i=0;i<frames;++i) {
    const unsigned p=s->write_position;
    float l=dry_left[i]+1.0f;l=l-1.0f;
    float r=dry_right[i]+1.0f;r=r-1.0f;
    if(!s->frozen){capture_left[p]=l;capture_right[p]=r;}
    ring_left[p]=ring_value(capture_left[p],wet_left[i],s->feedback,s->dc_coefficient,s->low_state_left);
    ring_right[p]=ring_value(capture_right[p],wet_right[i],s->feedback,s->dc_coefficient,s->low_state_right);
    dry_left[i]=std::fma(s->wet_mix,wet_left[i]-l,l);
    dry_right[i]=std::fma(s->wet_mix,wet_right[i]-r,r);
    s->write_position=(p+1==ring_length)?0:p+1;
 }
}
