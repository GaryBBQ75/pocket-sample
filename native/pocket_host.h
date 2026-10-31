#ifndef POCKET_HOST_H
#define POCKET_HOST_H
#ifdef __cplusplus
extern "C" {
#endif
void* pocket_host_create(float sample_rate);
void pocket_host_destroy(void*);
/* Audio-thread only. Bounded UI controls; no concurrent mutation. */
int pocket_host_configure(void*,float duration_ms,float density,float semitones,
    float window,float stereo,float feedback,float wet,int freeze,int reverse);
int pocket_host_process(void*,float* interleaved,unsigned frames);
int pocket_host_set_effects(void*,int granulator_enabled,int delay_enabled);
int pocket_host_set_delay(void*,float left_milliseconds,float right_milliseconds);
#ifdef __cplusplus
}
#endif
#endif
