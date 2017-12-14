let fs = require('fs')

class Encryptor {
    
    constructor(objects, path){
        
        this.objects = objects
        this.path = path
        
        this.floatArrays = []
        this.dictionary = []

        this.parse()

    }

    parse(){

        let arrayLength = 0

        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i]
            
            let tmp = {
                name: object.name
            }
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    const element = object[key];
                    if (element != null && element.constructor === Float32Array || element != null && element.constructor === Uint32Array) {
                        
                        arrayLength += element.length
                        let offset = arrayLength - element.length

                        tmp[key] = {
                            type: element.constructor === Float32Array ? 'Float32Array' : 'Uint32Array',
                            length: element.length,
                            offset: offset
                        }

                        this.floatArrays.push(element)
                    } else {
                        tmp[key] = element
                    }
                }
            }
            this.dictionary.push(tmp)
        }    

        // Total lengthh * 4 byte ( 32bit = 4bytes )
        let buffer = new Buffer(arrayLength * 4)
        let idx = 0
        
        for (let i = 0; i < this.floatArrays.length; i++) {
            const array = this.floatArrays[i];
            for (let j = 0; j < array.length; j++) {
                buffer.writeFloatLE(array[j], idx * 4)
                idx++
            }
        }
        
        this.bufferLength = arrayLength
        console.log('  ')
        console.log('Writing data');
        console.log('|--- Buffer length :', arrayLength)
        
        this.writeBinary(buffer)
        this.writeDictionary()
        
    }

    writeBinary(buffer){
        this.stream = fs.createWriteStream(this.path + '.bin')
        this.stream.write(buffer)
        this.stream.end()
        console.log('|------ Binary writed')
    }

    writeDictionary(){
        const content = JSON.stringify({
            type: "Mesh data",
            version: "0.0.1",
            bufferLength: this.bufferLength,
            meshes: this.dictionary
        })
        fs.writeFile(this.path + '.json', content, 'utf8', function (err) {
            if (err) {
                return console.log(err)
            }
            console.log('|------ Dictionnary writed')

            console.log(" ")
            console.log("- ALL CLEAR")
            console.log(" ")
        })
    }

}
module.exports = Encryptor