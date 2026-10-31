'use strict';
// Independent WSOLA-style offline stretch. No Akai code or external dependency.
function stretch(channels,ratio,rate=44100,progress=()=>{}){
  if(!Array.isArray(channels)||!channels.length||channels.length>2||!channels.every(c=>c instanceof Float32Array&&c.length===channels[0].length)||!Number.isFinite(ratio)||ratio<.5||ratio>2||rate!==44100)throw Error('Paramètres d’étirement invalides.');
  const length=channels[0].length,size=Math.round(length*ratio);
  if(length<Math.round(rate*.08)||length>rate*60||size>rate*60)throw Error('Durée prise en charge : de 80 ms à 60 secondes.');
  for(const channel of channels)for(const sample of channel)if(!Number.isFinite(sample)||Math.abs(sample)>32)throw Error('Signal audio invalide.');
  if(ratio===1)return channels.map(c=>c.slice());
  const hop=Math.round(rate*.02),windowSize=hop*2,search=Math.round(rate*.01),output=channels.map(()=>new Float32Array(size)),weight=new Float32Array(size),window=new Float32Array(windowSize);
  for(let j=0;j<windowSize;j++)window[j]=.5-.5*Math.cos(2*Math.PI*(j+.5)/windowSize);
  // Use the higher-energy channel for matching; a single offset serves both channels.
  let reference=channels[0],energy=-1;
  for(const channel of channels){let sum=0;for(let j=0;j<length;j+=8)sum+=channel[j]*channel[j];if(sum>energy){energy=sum;reference=channel}}
  let previous=0,lastPercent=-1;
  for(let pos=0;pos<size;pos+=hop){
    const expected=Math.round(pos/ratio),low=Math.max(0,expected-search),high=Math.min(length-windowSize,expected+search);
    let chosen=Math.min(Math.max(0,expected),Math.max(0,length-windowSize));
    if(pos>0&&high>=low){
      let best=-Infinity;
      const score=candidate=>{let xy=0,xx=0,yy=0;for(let j=0;j<hop;j+=4){const a=reference[previous+hop+j]||0,b=reference[candidate+j]||0;xy+=a*b;xx+=a*a;yy+=b*b}return xx*yy>1e-16?xy/Math.sqrt(xx*yy)-Math.abs(candidate-expected)*1e-8:-Math.abs(candidate-expected)};
      for(let candidate=low;candidate<=high;candidate+=8){const value=score(candidate);if(value>best){best=value;chosen=candidate}}
      const center=chosen;for(let candidate=Math.max(low,center-7);candidate<=Math.min(high,center+7);candidate++){const value=score(candidate);if(value>best){best=value;chosen=candidate}}
    }
    // Last frame reaches the source end; extend with zeros rather than repeat a tail.
    if(expected>=length-windowSize)chosen=Math.max(0,expected);
    for(let j=0;j<windowSize&&pos+j<size;j++){const w=window[j];weight[pos+j]+=w;for(let c=0;c<channels.length;c++)output[c][pos+j]+=(channels[c][chosen+j]||0)*w}
    previous=chosen;const percent=Math.min(99,Math.floor(pos/size*100));if(percent>=lastPercent+5){lastPercent=percent;progress(percent)}
  }
  for(let i=0;i<size;i++)if(weight[i]>1e-8)for(const channel of output)channel[i]/=weight[i];
  const fade=Math.min(128,Math.floor(size/100));for(let i=0;i<fade;i++)for(const channel of output){channel[i]*=i/fade;channel[size-1-i]*=i/fade}
  progress(100);return output;
}
self.onmessage=event=>{try{const {channels,ratio,rate}=event.data,result=stretch(channels,ratio,rate,percent=>self.postMessage({percent}));self.postMessage({channels:result},result.map(c=>c.buffer))}catch(e){self.postMessage({error:e.message})}};
