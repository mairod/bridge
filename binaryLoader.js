import when from 'when'

class binaRyLoader {
    constructor(json, bin) {
        this.json = json
        this.bin = bin
        this.itemLoaded = 0
        if (typeof this.json === "string") { this.loadJson().then((result) => { this.json = result; this.itemLoaded++; this.checkIfItemIsloaded() }) } else { this.itemLoaded++ }
        if (typeof this.bin === "string") { this.loadBin().then((result) => { this.bin = result; this.itemLoaded++; this.checkIfItemIsloaded() }) } else { this.itemLoaded++ }
        if (this.itemLoaded === 2) { this.init() }

        this.defer = when.defer()
        return this.defer.promise
    }

    loadJson() {
        let defer = when.defer()
        let oReq = new XMLHttpRequest()
        oReq.open("GET", this.json, true)
        oReq.responseType = "json"
        oReq.onload = function (e) {
            defer.resolve(oReq.response)
        }
        oReq.send()
        return defer.promise
    }

    loadBin() {
        let defer = when.defer()
        let oReq = new XMLHttpRequest()
        oReq.open("GET", this.bin, true)
        oReq.responseType = "arraybuffer"
        oReq.onload = function (e) {
            defer.resolve(oReq.response)
        }
        oReq.send()
        return defer.promise
    }

    checkIfItemIsloaded() {
        if (this.itemLoaded === 2) { this.init() }
    }

    init() {
        let objects = this.json.meshes
        for (let i = 0; i < objects.length; i++) {
            const el = objects[i];

            if (el.vertices != null) {
                let v = el.vertices
                el.vertices = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.normal != null) {
                let v = el.normal
                el.normal = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.uvs != null) {
                let v = el.uvs
                el.uvs = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.indices != null) {
                let v = el.indices
                let index = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
                let tmp = []
                for (let j = 0; j < index.length; j++) { tmp.push(index[j]) }
                el.indices = new Uint32Array(tmp)
            }
        }

        this.defer.resolve(objects)
    }
}
export default binaRyLoader