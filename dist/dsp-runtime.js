export function makeDSP(module,rate) {
  const instance=new WebAssembly.Instance(module,{wasi_snapshot_preview1:{fd_close:()=>0,fd_write:()=>0,fd_seek:()=>0}});
  const api=instance.exports;api._initialize();
  const handle=api.pocket_host_create(rate),ptr=api.malloc(256*4);
  if(!handle||!ptr)throw Error('Initialisation du granulateur impossible.');
  const memory=new Float32Array(api.memory.buffer,ptr,256);
  return {
    configure(p){if(!api.pocket_host_configure(handle,p.duration,p.density,p.pitch,p.window,p.stereo,p.feedback,p.wet,p.freeze?1:0,p.reverse?1:0)||!api.pocket_host_set_effects(handle,p.enabled?1:0,p.delayEnabled?1:0)||!api.pocket_host_set_delay(handle,p.delayLeft||0,p.delayRight||0))throw Error('Réglage audio hors limites.');},
    process(left,right,outL,outR,frames=left.length){
      for(let i=0;i<frames;i++){memory[i*2]=left[i]||0;memory[i*2+1]=right[i]||0;}
      if(!api.pocket_host_process(handle,ptr,frames))throw Error('Traitement du granulateur impossible.');
      for(let i=0;i<frames;i++){outL[i]=memory[i*2];outR[i]=memory[i*2+1];}
    },
    dispose(){api.pocket_host_destroy(handle);api.free(ptr);}
  };
}
