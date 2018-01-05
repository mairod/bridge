let numberOfConfetis = 100

class Custom {
  constructor( parts ){

      this.in = parts
      this.refractor()

      return this.in

  }

  refractor(){

    this.in[0].uvs = null

    this.baseVertices = this.in[0].vertices
    this.baseNormal = this.in[0].normal
    

    this.in[0].vertices = null
    this.in[0].normal = null
    this.in[0].indices = null

    let actualIndex = 0

    let tmpVertices = []
    let tmpNormal   = []
    let tmpIndices  = []
    let tmpSeed1     = []
    let tmpSeed2     = []
    let tmpSeed3     = []
    let tmpSeed4     = []

    for (let i = 0; i < numberOfConfetis; i++) {

      const seed1 = Math.random()
      const seed2 = Math.random()
      const seed3 = Math.random()
      const seed4 = Math.random()

      for (let j = 0; j < this.baseVertices.length; j++) {

        const vert = this.baseVertices[j];
        const norm = this.baseNormal[j];
        
        tmpVertices.push(vert)
        tmpNormal.push(norm)
        
      }
      for (let j = 0; j < this.baseVertices.length / 3; j++) {

        tmpSeed1.push(seed1)
        tmpSeed2.push(seed2)
        tmpSeed3.push(seed3)
        tmpSeed4.push(seed4)
        
        tmpIndices.push(actualIndex)
        actualIndex++
      }
    }

    this.in[0].vertices = new Float32Array(tmpVertices)
    this.in[0].normal   = new Float32Array(tmpNormal)
    this.in[0].indices  = new Uint32Array(tmpIndices)
    this.in[0].seed1     = new Float32Array(tmpSeed1)
    this.in[0].seed2     = new Float32Array(tmpSeed2)
    this.in[0].seed3     = new Float32Array(tmpSeed3)
    this.in[0].seed4     = new Float32Array(tmpSeed4)
    
  }
}
module.exports = Custom