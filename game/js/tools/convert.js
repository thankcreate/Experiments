var fs = require('fs');
var path = require('path');
var readline = require('readline');

var folderPath = "f:/DrawData/";

var filePath = path.resolve(folderPath);
var outputPath = filePath + "/output/"

console.log("FolderPath: " + folderPath);

fs.existsSync(outputPath) || fs.mkdirSync(outputPath);
var total = 0;



fs.readdir(filePath,function(err,files){
    if(err) {
        console.warn(err);
    }
    else{
        
        files.forEach(filename => {            
            if(path.extname(filename) === ".ndjson")
                total ++;           
        });


        console.log("Total file count: " + total);
        var i = 0;
        files.forEach(filename => {
            
            
            var fileFullPath = path.join(filePath, filename);            
            var ext = path.extname(filename);
            var index = path.basename(filename).lastIndexOf(ext);
            var baseName = path.basename(filename).substring(0, index);

            if(ext === ".ndjson") {
                
                i++;
                // console.log(baseName);
                convertFile(fileFullPath, baseName, i);
            }            
        });
    }
});

function writeFile(fileFullPath, baseName, ob, i) {    
    baseName = baseName.split(' ').join('-').toLowerCase();
    var newFilePath = path.join(outputPath, baseName + ".json");
    fs.writeFile(newFilePath, JSON.stringify(ob), function(err) {});
    console.log("File: " + i + "/" + total +  "    "+ newFilePath + "    completed");
}


function convertFile(fileFullPath, baseName, i) {

    var collection = [];
    
    var lineReader = readline.createInterface({
        input: fs.createReadStream(fileFullPath),
    });

    var max = 10;
    var writen = false;
    lineReader.on('line', function(line) {
        var lineObject = JSON.parse(line);
        collection.push(lineObject)
        if(--max == 0) {            
            lineReader.close();
            if(!writen) {
                writen = true;
                writeFile(fileFullPath, baseName, collection, i);
            }    
        }
    });

    lineReader.on('close', function(){                

        if(!writen) {
            writen = true;
            writeFile(fileFullPath, baseName, collection, i);
        }
    })
}