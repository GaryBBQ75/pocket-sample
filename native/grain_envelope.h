#ifndef POCKET_GRAIN_ENVELOPE_H
#define POCKET_GRAIN_ENVELOPE_H
#ifdef __cplusplus
extern "C" {
#endif
/* Generates the isolated 256-value grain window. The caller supplies 256 floats.
   Controls are finite normalized values in [0,1]; values are not clamped here.
   This is one DSP primitive, not a complete granulator or sampler engine. */
void pocket_grain_envelope(float amount, float skew, float* output_256);
#ifdef __cplusplus
}
#endif
#endif
