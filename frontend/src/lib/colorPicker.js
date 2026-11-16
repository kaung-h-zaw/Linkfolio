export function hexToHsv(hex) {
  const channels = hex.replace('#','').match(/.{2}/g)?.map(value => parseInt(value,16)/255) || [0,0,0]
  const [r,g,b] = channels
  const max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max-min
  let h = 0
  if (delta) h = max === r ? ((g-b)/delta)%6 : max === g ? (b-r)/delta+2 : (r-g)/delta+4
  return {h:(h*60+360)%360,s:max ? delta/max : 0,v:max}
}

export function hsvToHex({h,s,v}) {
  const channel = n => {
    const k = (n+h/60)%6
    return Math.round((v-v*s*Math.max(0,Math.min(k,4-k,1)))*255).toString(16).padStart(2,'0')
  }
  return `#${channel(5)}${channel(3)}${channel(1)}`
}
