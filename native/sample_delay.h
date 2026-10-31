#ifndef POCKET_SAMPLE_DELAY_H
#define POCKET_SAMPLE_DELAY_H
#ifdef __cplusplus
extern "C" {
#endif
typedef struct {
    float *left_ring,*right_ring;
    int length,write_position,left_position,right_position,left_previous,right_previous;
    float left_fade,right_fade,fade_step,sample_rate,left_requested,right_requested;
    int left_dirty,right_dirty;
} PocketSampleDelay;
/* Caller supplies zeroed rings of floor(sample_rate*.25)+1 floats. Thread
   confined; all audio buffers must be valid and distinct from ring storage.
   Models normalized delay controls, not the UI's link/automation plumbing. */
int pocket_sample_delay_init(PocketSampleDelay*,float,float*,float*,int);
int pocket_sample_delay_set(PocketSampleDelay*,float normalized_left,float normalized_right);
void pocket_sample_delay_process(PocketSampleDelay*,float*,float*,unsigned);
#ifdef __cplusplus
}
#endif
#endif
