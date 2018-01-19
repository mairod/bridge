var when = require('when')

function BinaryMeshLoader(json, bin) {

    this.json = json
    this.bin = bin
    this.itemLoaded = 0
    this.defer = when.defer()

    var that = this

    if (typeof this.json === "string") {
        this.loadJson().then(
            function (result) {
                that.json = result
                that.itemLoaded++
                that.checkIfItemIsloaded()
            }
        )
    } else {
        this.itemLoaded++
    }

    if (typeof this.bin === "string") {
        this.loadBin().then(
            function (result) {
                that.bin = result
                that.itemLoaded++
                that.checkIfItemIsloaded()
            }
        )
    } else {
        this.itemLoaded++
    }

    if (this.itemLoaded === 2) { this.init() }

    return this.getPromise()

}

BinaryMeshLoader.prototype = {

    init: function () {
        var objects = this.json.meshes

        var defaultProperties = ["vertices", "normal", "uvs", "indices", "name", "type", "translate", "scale", "infos"]

        for (var i = 0; i < objects.length; i++) {
            var el = objects[i]

            if (el.vertices != null) {
                var v = el.vertices
                el.vertices = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.normal != null) {
                var v = el.normal
                el.normal = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.uvs != null) {
                var v = el.uvs
                el.uvs = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
            }
            if (el.indices != null) {
                var v = el.indices
                var index = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
                var tmp = []
                for (var j = 0; j < index.length; j++) { tmp.push(index[j]) }
                el.indices = new Uint16Array(tmp)
            }

            for (var key in el) {
                if (el.hasOwnProperty(key) && defaultProperties.indexOf(key) === -1 && el[key] != null) {
                    var v = el[key]
                    el[key] = new Float32Array(this.bin.slice(v.offset * 4, (v.offset * 4) + (v.length * 4)))
                }
            }
        }

        this.defer.resolve(objects)
    },

    getPromise: function () {
        return this.defer.promise
    },

    loadJson: function () {
        var defer = when.defer()
        var oReq = new XMLHttpRequest()
        oReq.open("GET", this.json, true)
        oReq.responseType = "json"
        oReq.onload = function (e) {
            defer.resolve(oReq.response)
        }
        oReq.send()
        return defer.promise
    },

    loadBin: function () {
        var defer = when.defer()
        var oReq = new XMLHttpRequest()
        oReq.open("GET", this.bin, true)
        oReq.responseType = "arraybuffer"
        oReq.onload = function (e) {
            defer.resolve(oReq.response)
        }
        oReq.send()
        return defer.promise
    },

    checkIfItemIsloaded: function () {
        if (this.itemLoaded === 2) { this.init() }
    }

}

module.exports = BinaryMeshLoader