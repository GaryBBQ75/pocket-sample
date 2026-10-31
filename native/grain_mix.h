#ifndef POCKET_GRAIN_MIX_H
#define POCKET_GRAIN_MIX_H
#ifdef __cplusplus
extern "C" {
#endif
typedef struct {
 float low_state_left,low_state_right,dc_coefficient,feedback,wet_mix;
 unsigned write_position;
 int frozen;
} PocketGrainMix;
/* All arrays must be valid, nonoverlapping, and cover their declared lengths.
   Ring length > 0; starting write position < length. No allocation or I/O. */
void pocket_mix_grains(PocketGrainMix*,float*,float*,const float*,const float*,
                       float*,float*,float*,float*,unsigned,unsigned);
#ifdef __cplusplus
}
#endif
#endif
