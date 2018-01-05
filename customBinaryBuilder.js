


// ----------------------
let FILE = "confeti"
// ----------------------





let fs = require('fs')
let xml2js = require('xml2js')

let Interpretor = require('./lib/coladaInterpretor')
let Encryptor = require('./lib/encryptor')
let Custom = require('./lib/customStuff')

let _parser = new xml2js.Parser()


fs.readFile(__dirname + '/IN/' + FILE + '.dae', function (err, data) {
  _parser.parseString(data, function (err, result) {

    
    console.log('  ');
    let parts = new Interpretor(result, {
      onlyVertices: false,
      scale: 1,
      optimize: false
    })
    printJson(parts)

    parts = new Custom(parts)

    console.log('  ');
    console.log('Objects Infos');
    console.log("|-- Numbers of Objects :", parts.length)

    // Make json dictionary + binary file
    new Encryptor(parts, __dirname + "/OUT/" + FILE)

  })
})

function printJson(result){
    const content = JSON.stringify(result)
    fs.writeFile(__dirname + '/prout.json', content, 'utf8', function (err) {
        if (err) {
            return console.log(err)
        }
    })
}