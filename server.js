const http = require('http');
const url = require('url')
const fs = require('fs')

const args = process.argv.slice(2);
const LOCAL_DATABASE = 'students.json'

if(args.length !== 1) {
    console.log("usage: node main.js <PORT>");
    process.exit(0)
}

const port = args[0];

const server = http.createServer(function(req, res) {
    const { pathname, query } = url.parse(req.url, true);
    
    if(pathname.match(/^\/$/)) {
        res.write(`<h1>Hello ${query['name'] || 'World'}!</h1>`);
    } else if(pathname.match(/^\/students$/)) {
        if (req.method == 'POST') {
            let jsonString = '';
            req.on('data', chunk => {
                jsonString += chunk.toString();
            });
            req.on('end', () => {
                let user = JSON.parse(jsonString);
                let arrJson;
                if (!fs.existsSync(LOCAL_DATABASE)) {
                  user.id = 1;
                  arrJson = [user];
                } else {
                  arrJson = require(`./${LOCAL_DATABASE}`)
                  user.id = arrJson.length + 1;
                  arrJson.push(user);
                }
                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(arrJson, null, 4))
              })
        } else if(req.method == 'DELETE') {
            if (fs.existsSync(LOCAL_DATABASE)) {
                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify([], null, 4))
            }
        }
    } else if(pathname.match(/^\/students\/\d$/)) {
        const id = pathname.replace(/^\/students\/(\d)$/, "$1")
        let jsonString = '';
        req.on('data', chunk => {
            jsonString += chunk.toString();
        });
        req.on('end', () => {
            const user = JSON.parse(jsonString);
            if (fs.existsSync(LOCAL_DATABASE)) {
                const arrJson = require(`./${LOCAL_DATABASE}`)
                const index = arrJson.findIndex(obj => obj.id == id);
                if(index > -1) {
                    if (req.method == 'PUT') { 
                        arrJson[index].name = setJson(arrJson[index], user, "name");
                        arrJson[index].school = setJson(arrJson[index], user, "school");
                    } else if(req.method == 'DELETE') {
                        arrJson.splice(index, 1);
                    }
                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(arrJson, null, 4))
                }
            }
        })
    }

    
    res.end();
});

function setJson(oldObj, newObj, property) {
    return newObj.hasOwnProperty(property) ? newObj[property] : oldObj[property];
}


server.listen(port);
console.log(`Server is listening on port ${port}`)