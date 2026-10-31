#include "sample_delay.h"
#include <cmath>
extern "C" int pocket_sample_delay_init(PocketSampleDelay* s,float rate,
    float* left,float* right,int length) {
    if(!s||!left||!right||!std::isfinite(rate)||rate<8000||rate>192000||
       length!=static_cast<int>(rate*.25f)+1)return 0;
    *s=PocketSampleDelay{};s->left_ring=left;s->right_ring=right;
    s->length=length;s->sample_rate=rate;s->fade_step=(rate/44100.f)*0x1p-9f;
    return 1;
}
extern "C" int pocket_sample_delay_set(PocketSampleDelay* s,float left,float right) {
    if(!s||!std::isfinite(left)||!std::isfinite(right)||left<0||left>1||right<0||right>1)return 0;
    if(left!=s->left_requested){s->left_requested=left;s->left_dirty=1;}
    if(right!=s->right_requested){s->right_requested=right;s->right_dirty=1;}
    return 1;
}
static void request(PocketSampleDelay& s,int& position,int& previous,
    float& fade,int& dirty,float target) {
    if(dirty&&fade==0.f){
        previous=position;fade=1.f;
        const float seconds=target*.25f;
        position=s.write_position-static_cast<int>(s.sample_rate*seconds);
        if(position<0)position+=s.length;
        dirty=0;
    }
}
static int advance(int value,int length){return value+1==length?0:value+1;}
extern "C" void pocket_sample_delay_process(PocketSampleDelay* state,
    float* left,float* right,unsigned frames) {
    auto& s=*state;
    request(s,s.left_position,s.left_previous,s.left_fade,s.left_dirty,s.left_requested);
    request(s,s.right_position,s.right_previous,s.right_fade,s.right_dirty,s.right_requested);
    for(unsigned i=0;i<frames;++i){
        s.left_ring[s.write_position]=left[i];s.right_ring[s.write_position]=right[i];
        float l=s.left_ring[s.left_position],r=s.right_ring[s.right_position];
        if(s.left_fade>0.f){
            l=std::fma(s.left_ring[s.left_previous],s.left_fade,(1.f-s.left_fade)*l);
            s.left_previous=advance(s.left_previous,s.length);
            const float fade=s.left_fade-s.fade_step;s.left_fade=fade>0.f?fade:0.f;
        }
        if(s.right_fade>0.f){
            r=std::fma(s.right_ring[s.right_previous],s.right_fade,(1.f-s.right_fade)*r);
            s.right_previous=advance(s.right_previous,s.length);
            const float fade=s.right_fade-s.fade_step;s.right_fade=fade>0.f?fade:0.f;
        }
        left[i]=l;right[i]=r;
        s.write_position=advance(s.write_position,s.length);
        s.left_position=advance(s.left_position,s.length);
        s.right_position=advance(s.right_position,s.length);
    }
}
