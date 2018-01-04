class Interpretor {
  constructor(objFromXml) {

    this.input = objFromXml
    this.objects = {}
    this.findParts()
    this.findAnims()
    this.refactorObjects()

    return this.objects
  }

  findParts(){

    let col = this.input.COLLADA

    let objects = col["library_visual_scenes"][0]["visual_scene"][0]["node"]
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        let name = obj["$"]["name"]
        let id = obj["$"]["id"]
        console.log(" ")
        console.log('Found Object :', name)
        this.objects[id] = {
          name: name,
          animations: {}
        }
      }
  }

  findAnims(){

    let col = this.input.COLLADA
    let anims = col['library_animations']    

    for (let i = 0; i < anims.length; i++) {

      for (let l = 0; l < anims[i]["animation"].length; l++) {
        const anim = anims[i]["animation"][l];
        for (let j = 0; j < anim["animation"].length; j++) {
            const animCompo = anim["animation"][j];
            
            let chanel           = animCompo["channel"][0]["$"]
            let sources          = animCompo["source"]
            let sampler          = animCompo["sampler"][0]
            let target           = chanel["target"].split('/')[0]
            let targetChannel    = chanel["target"].split('/')[1].split('.')[0]
            let targetChannelDim = chanel["target"].split('/')[1].split('.')[1].toLowerCase()
  
            if (this.objects[target].animations[targetChannel] == undefined) {
              this.objects[target].animations[targetChannel] = {
                stride: 0,
                components: [],
                frameLength: 0,
                source: {}
              }
              console.log("|-- Object anim channel:", targetChannel)
            }
            console.log("|---- Object anim property:", targetChannelDim)
            
            let outputSource = ""
            for (let k = 0; k < sampler["input"].length; k++) {
              const input = sampler["input"][k]["$"];
              if (input["semantic"] === "OUTPUT") {
                outputSource = input["source"].split('#').join('')
              }
            }
  
            let _source
            for (let k = 0; k < sources.length; k++) {
              const source = sources[k];
              const id = sources[k]["$"]["id"]
              if (id === outputSource) {
                _source = sources[k]["float_array"][0]["_"].split(' ')
              }
            }
  
            this.objects[target].animations[targetChannel].stride ++
            this.objects[target].animations[targetChannel].frameLength = _source.length
            this.objects[target].animations[targetChannel].components.push(targetChannelDim)
            this.objects[target].animations[targetChannel].source[targetChannelDim] = {
              source: _source
            }
        } 
      }
      console.log(" ");
    }
  }

  refactorObjects(){

    let out = []

    for (const key in this.objects) {
      if (this.objects.hasOwnProperty(key)) {
        out.push(this.objects[key])
      }
    }

    for (let i = 0; i < out.length; i++) {
      const element = out[i];
      
      for (const key in element) {
        if (element.hasOwnProperty(key) && key === 'animations') {
          const channel = element[key];
          
          let props = []
          for (const key in channel) {
            if (channel.hasOwnProperty(key)) {
              const _comp = channel[key];
              
              let tmp = []
              
              for (let j = 0; j < _comp.frameLength; j++) {
                for (let k = 0; k < _comp.components.length; k++) {
                  const _comt = _comp.components[k];                  
                  tmp.push(_comp.source[_comt].source[j])
                }
              }
              _comp.source = new Float32Array(tmp)
            }
          }
        }
      }
    }
    this.objects = out
  }

}
module.exports = Interpretor