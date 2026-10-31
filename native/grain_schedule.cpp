#include "grain_schedule.h"
#include <cmath>
extern "C" void pocket_schedule_grains(PocketGrainSchedule* s,int frames,void* context,
 PocketProcessSpan process,PocketTrySpawn spawn,PocketRandomDraw random) {
 if(s->countdown>s->interval)s->countdown=s->interval;
 if(frames<=s->countdown){
  if(s->channels)process(context,0,frames);
  s->countdown-=frames;
  return;
 }
 if(s->channels)process(context,0,s->countdown);
 spawn(context);
 if(s->channels)process(context,s->countdown,frames-s->countdown);
 const float draw=random(context)-0.5f;
 const float factor=std::fma(s->interval_spread,draw,1.0f);
 s->countdown=static_cast<int>(static_cast<float>(s->interval)*factor);
}
