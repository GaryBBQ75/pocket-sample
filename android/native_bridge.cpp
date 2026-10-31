#include "pocket_host.h"
#include <jni.h>
#include <cmath>
#include <cstdint>
#include <algorithm>
struct Engine { void* dsp; uint64_t clock=0; uint32_t noise=17; float block[256]{}; };
extern "C" JNIEXPORT jlong JNICALL Java_com_gary_pocketsample_MainActivity_createEngine(JNIEnv*,jclass) {
    auto* e=new Engine{};e->dsp=pocket_host_create(48000);
    if(!e->dsp){delete e;return 0;}return reinterpret_cast<jlong>(e);
}
extern "C" JNIEXPORT void JNICALL Java_com_gary_pocketsample_MainActivity_destroyEngine(JNIEnv*,jclass,jlong id) {
    auto* e=reinterpret_cast<Engine*>(id);if(e){pocket_host_destroy(e->dsp);delete e;}
}
extern "C" JNIEXPORT jint JNICALL Java_com_gary_pocketsample_MainActivity_renderEngine(
 JNIEnv* env,jclass,jlong id,jfloatArray output,jfloatArray controls,jint source,jboolean freeze,jboolean reverse,jboolean delay) {
    auto* e=reinterpret_cast<Engine*>(id);
    if(!e||env->GetArrayLength(output)<256||env->GetArrayLength(controls)<9)return 0;
    float c[9];env->GetFloatArrayRegion(controls,0,9,c);
    if(!pocket_host_configure(e->dsp,c[0],c[1],c[2],c[3],c[4],c[5],c[6],freeze,reverse))return 0;
    if(!pocket_host_set_effects(e->dsp,1,delay)||!pocket_host_set_delay(e->dsp,c[7],c[8]))return 0;
    for(unsigned i=0;i<128;++i){
        const double t=static_cast<double>(e->clock++)/48000.;
        const double beat=std::fmod(t,.5);const double phase=6.283185307179586*t;
        e->noise=e->noise*1664525u+1013904223u;
        const float noise=static_cast<float>(e->noise>>8)/8388608.f-1.f;
        float value;
        if(source==0)value=.6f*std::sin(phase*55+8*(1-std::exp(-beat*35)))*std::exp(-beat*15);
        else if(source==1)value=.35f*noise*std::exp(-beat*20);
        else if(source==2)value=.24f*(std::sin(phase*110)+.3f*std::sin(phase*220))*std::exp(-beat*4);
        else value=.13f*(std::sin(phase*261.63)+std::sin(phase*329.63)+std::sin(phase*392));
        e->block[i*2]=value;e->block[i*2+1]=value;
    }
    if(!pocket_host_process(e->dsp,e->block,128))return 0;
    for(float& value:e->block)value=std::clamp(value,-.9f,.9f);
    env->SetFloatArrayRegion(output,0,256,e->block);return 256;
}
