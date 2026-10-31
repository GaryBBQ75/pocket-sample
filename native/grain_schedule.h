#ifndef POCKET_GRAIN_SCHEDULE_H
#define POCKET_GRAIN_SCHEDULE_H
#ifdef __cplusplus
extern "C" {
#endif
typedef struct { int countdown,interval,channels; float interval_spread; } PocketGrainSchedule;
typedef void (*PocketProcessSpan)(void*,int,int);
typedef void (*PocketTrySpawn)(void*);
typedef float (*PocketRandomDraw)(void*);
/* Caller owns preallocated grain pool. try_spawn must check capacity after the
   preceding span and do nothing if full. Callbacks must not allocate or block. */
void pocket_schedule_grains(PocketGrainSchedule*,int,void*,PocketProcessSpan,PocketTrySpawn,PocketRandomDraw);
#ifdef __cplusplus
}
#endif
#endif
