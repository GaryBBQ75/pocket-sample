(()=>{
  let modulePromise;
  const module=()=>modulePromise||(modulePromise=fetch('pocket-dsp.wasm').then(r=>{if(!r.ok)throw Error('Le moteur audio ne se charge pas.');return r.arrayBuffer();}).then(WebAssembly.compile).catch(e=>{modulePromise=null;throw e}));
  window.PocketDSP={
    async connect(context,input,settings,destination=context.destination,onState=()=>{}){
      if(!context.audioWorklet)throw Error('AudioWorklet nécessite un navigateur récent et HTTPS.');
      const [compiled]=await Promise.all([module(),context.audioWorklet.addModule('granulator-worklet.js?v=8')]);
      const node=new AudioWorkletNode(context,'pocket-granulator',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{module:compiled,settings}});
      try{await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(Error('Le moteur audio ne répond pas.')),5000);
        node.port.onmessage=({data})=>{onState(data);if(data.type==='ready'){clearTimeout(timeout);resolve()}if(data.error){clearTimeout(timeout);reject(Error(data.error))}};
        node.onprocessorerror=()=>{const data={type:'error',error:'Le processeur audio a été interrompu.'};onState(data);clearTimeout(timeout);reject(Error(data.error))};
        input.connect(node);node.connect(destination);
      });return node}catch(error){input.disconnect(node);node.disconnect();node.port.close();throw error}
    },
    async processBuffer(buffer,settings){
      const left=buffer.getChannelData(0).slice(),right=buffer.getChannelData(buffer.numberOfChannels>1?1:0).slice();
      if(!settings.enabled&&!settings.delayEnabled)return [left,right];
      const compiled=await module();return new Promise((resolve,reject)=>{const worker=new Worker('render-worker.js',{type:'module'}),timeout=setTimeout(()=>{worker.terminate();reject(Error('Traitement audio trop long.'))},60000);const finish=()=>{clearTimeout(timeout);worker.terminate()};worker.onmessage=({data})=>{if(data.progress!==undefined)return;finish();if(data.error)reject(Error(data.error));else resolve([data.left,data.right])};worker.onerror=e=>{finish();reject(Error(e.message||'Traitement impossible.'))};worker.postMessage({module:compiled,rate:buffer.sampleRate,settings,gain:1,mode:'pcm',left,right},[left.buffer,right.buffer])});
    },
    async exportWav(buffer,settings,gain,onProgress){
      const compiled=settings.enabled||settings.delayEnabled?await module():null;
      return new Promise((resolve,reject)=>{
        const worker=new Worker('render-worker.js',{type:'module'}),left=buffer.getChannelData(0).slice(),right=buffer.getChannelData(buffer.numberOfChannels>1?1:0).slice();
        const timeout=setTimeout(()=>{worker.terminate();reject(Error('Le rendu a dépassé 60 secondes. Réduisez le nombre de mesures.'))},60000);
        function finish(){clearTimeout(timeout);worker.terminate()}
        worker.onmessage=({data})=>{if(data.progress!==undefined){onProgress?.(data.progress);return}finish();if(data.error)reject(Error(data.error));else resolve(new Blob([data.wav],{type:'audio/wav'}))};
        worker.onerror=event=>{finish();reject(Error(event.message||'Rendu indisponible sur ce navigateur.'))};
        worker.postMessage({module:compiled,rate:buffer.sampleRate,settings,gain,left,right},[left.buffer,right.buffer]);
      });
    }
  };
})();
