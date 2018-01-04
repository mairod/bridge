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
                target: object.name,
                animations: {}
            }
            for (const animKey in object.animations) {
                if (object.animations.hasOwnProperty(animKey)) {
                    const _el = object.animations[animKey];
                    tmp.animations[animKey] = {}
                    for (const key in _el) {
                        if (_el.hasOwnProperty(key) && key === "source") {
                            const element = _el[key];

                            if (element != null && element.constructor === Float32Array ) {
                                                                
                                arrayLength += element.length
                                let offset = arrayLength - element.length

                                let __tmp = {
                                    type: 'Float32Array',
                                    length: element.length,
                                    offset: offset
                                }
                                
                                tmp.animations[animKey][key] = __tmp
                                this.floatArrays.push(element)

                            }
                            
                        } else if(_el.hasOwnProperty(key)) {
                            const element = _el[key];
                            tmp.animations[animKey][key] = element
                        }
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
            type: "Animations",
            version: "0.0.1",
            bufferLength: this.bufferLength,
            animations: this.dictionary
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