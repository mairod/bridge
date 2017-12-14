
function getVerticesData(data, sp){
    for (let j = 0; j < data["vertices"].length; j++) {
        const vertice = data["vertices"][j]
        if (vertice["$"]["id"] === sp.vertices.source) {
            let srcID = vertice["input"][0]["$"]["source"].split('#').join('')
            for (let k = 0; k < data["source"].length; k++) {
                const src = data["source"][k];
                if (src["$"]["id"] === srcID) {
                   return source = new Float32Array(src["float_array"][0]["_"].split(' '))
                }
            }
        }
    }
}

function getVertexDataFromID(data, srcID){
    for (let k = 0; k < data["source"].length; k++) {
        const src = data["source"][k];
        if (src["$"]["id"] === srcID) {
            return source = new Float32Array(src["float_array"][0]["_"].split(' '))
        }
    }
}


class Interpretor {
    constructor(objFromXml){
        this.input = objFromXml
        this.parts = []
        this.findParts()

        return this.parts
    }

    findParts(){

        let col = this.input.COLLADA
        
        let objects = col["library_visual_scenes"][0]["visual_scene"][0]["node"]
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            let name = obj["$"]["name"]
            console.log(" ")
            console.log('Found Object :', name)
            let geomId = obj["instance_geometry"][0]["$"]["url"].split('#').join('')
            let translate = [
                parseFloat(obj["translate"][0]["_"].split(' ')[0]),
                parseFloat(obj["translate"][0]["_"].split(' ')[1]),
                parseFloat(obj["translate"][0]["_"].split(' ')[2]),
            ]
            let scale = [
                parseFloat(obj["scale"][0]["_"].split(' ')[0]),
                parseFloat(obj["scale"][0]["_"].split(' ')[1]),
                parseFloat(obj["scale"][0]["_"].split(' ')[2]),
            ]
            
            // TODO Rotation

            let geoms = this.computeGeomForID(geomId)
                        
            if (geoms != undefined) {
                for (let j = 0; j < geoms.length; j++) {
                    const _geom = geoms[j];
                    console.log("|---- Object num vertices :", _geom.indices.length)
                    this.parts.push({
                        name:           name,
                        type:           _geom.type,
                        translate:      translate,
                        scale:          scale,
                        vertices:       _geom.vertices,
                        normal:         _geom.normals != undefined ? _geom.normals : null,
                        uvs:            _geom.uvs != undefined ? _geom.uvs : null,
                        indices:        _geom.indices
                    })
                }
            }            
                       
        }

    }

    computeGeomForID(id){

        let col = this.input.COLLADA

        let geomData
        let geoms = col["library_geometries"][0]["geometry"]
        for (let i = 0; i < geoms.length; i++) {
            const element = geoms[i]
            if (element["$"]["id"] === id) {
                geomData = element["mesh"][0]
            }
        }
        
        if (geomData["linestrips"] != undefined) {
            console.log("|-- Object of type : LINE")
            return this.getLineGeom(geomData)
        } else if (geomData["triangles"] != undefined) {
            console.log("|-- Object of type : TRIANGLE")
            return this.getTriangleGeom(geomData)
        } else {
            console.error('FOUND OBJECT NOT SUPPORTED')
        }

    }

    getLineGeom(data){

        let col = this.input.COLLADA

        let out = []

        let _lineStrips = data["linestrips"]
        let strips = []

        // Get components in JS array 
        for (let i = 0; i < _lineStrips.length; i++) {
            const el = _lineStrips[i]
            let inputs = el["input"]

            let tmpInputs = {
                count: parseFloat(el["$"]["count"])
            }

            for (let j = 0; j < inputs.length; j++) {
                const component = inputs[j]

                if (component["$"]["semantic"] === "VERTEX") {
                    tmpInputs["vertices"] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                        index: el["p"][j].split(" ")
                    }
                } else {
                    tmpInputs[component["$"]["semantic"]] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                        index: el["p"][j].split(" ")
                    }
                }
            }

            strips.push(tmpInputs)
        }

        for (let i = 0; i < strips.length; i++) {
            const sp = strips[i]
            
            // Getting positions Array
            let source = getVerticesData(data, sp)

            // Getting indices
            let indices = new Uint32Array(sp["vertices"].index)

            out.push({
                type: 'line',
                vertices: source,
                indices: indices
            })

        }
        return out
    }

    getTriangleGeom(data) {

        let col = this.input.COLLADA

        let out = []

        let _triangles = data["triangles"]
        let tris = []

        // Get components in JS array 
        for (let i = 0; i < _triangles.length; i++) {
            const el = _triangles[i]
            let inputs = el["input"]
            let index = el["p"][0].split(" ")
            let components = []

            let tmpInputs = {
                count: inputs.length,
                index: index
            }

            for (let j = 0; j < inputs.length; j++) {
                const component = inputs[j]
                if (component["$"]["semantic"] === "VERTEX") {
                    tmpInputs["vertices"] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                    }
                    components.push('vertices')
                } else if (component["$"]["semantic"] === "NORMAL") {
                    tmpInputs["normal"] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                    }
                    components.push('normal')
                } else if (component["$"]["semantic"] === "TEXCOORD") {
                    tmpInputs["uvs"] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                    }              
                    components.push('uvs')      
                } else {
                    tmpInputs[component["$"]["semantic"]] = {
                        offset: component["$"]["offset"],
                        source: component["$"]["source"].split('#').join(''),
                    }
                    components.push(component["$"]["semantic"])      
                }
            }
            tmpInputs["components"] = components
            tris.push(tmpInputs)
        }


        for (let i = 0; i < tris.length; i++) {
            const sp = tris[i]

            // Getting positions Array
            let _vertices = getVerticesData(data, sp)
            
            // Getting normal array
            let _normals = getVertexDataFromID(data, sp.normal.source)
            
            // Getting uv array
            let _uvs = getVertexDataFromID(data, sp.uvs.source)                        

            // Reconstituing real vertex data
            let instructions = sp.index
            let components   = sp.components
            let vertexDim    = components.length // each component dimension vec3 pos, vec3 norm, vec2 uv
            
            // Order : vertex, normal, uv
            let vertices = []
            let normals  = []
            let uvs      = []
            let indices  = []
            let index    = 0

            for (let i = 0; i < instructions.length / vertexDim; i++) {
                
                let vertexIdx = instructions[(i * vertexDim) + 0]
                let normalIdx = instructions[(i * vertexDim) + 1]
                let uvIdx     = instructions[(i * vertexDim) + 2]
                
                vertices.push(_vertices[vertexIdx * 3 + 0])
                vertices.push(_vertices[vertexIdx * 3 + 1])
                vertices.push(_vertices[vertexIdx * 3 + 2])
                
                normals.push(_normals[normalIdx * 3 + 0])
                normals.push(_normals[normalIdx * 3 + 1])
                normals.push(_normals[normalIdx * 3 + 2])
                
                uvs.push(_uvs[uvIdx * 2 + 0])
                uvs.push(_uvs[uvIdx * 2 + 1])

                indices.push(index)
                index++

            }
                        
            out.push({
                type:       'triangle',
                vertices:   new Float32Array(vertices),
                normals:    new Float32Array(normals),
                uvs:        new Float32Array(uvs),
                indices:    new Uint32Array(indices)
            })

        }
        return out
    }
}

module.exports = Interpretor