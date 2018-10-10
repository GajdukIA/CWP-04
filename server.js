const net = require('net');
const fs = require('fs');
const crypto = require('crypto');
const port = 8124;
const clientString = 'QA';
const clientString2='FILES';
const clientString3='REMOTE';
const good = 'ACK';
const bad = 'DEC';
let locationOfFile='D:\\';
let locShifred='D:\\shifred.txt';
let locShifCopy='D:\\shifred1.txt';
let locUnShifred='D:\\unshifred.txt';
let key="";
let logger = fs.createWriteStream('client_id.log');
//let filerr = fs.createWriteStream('my.log');
let p;
let cols;
let now=0;
let seed = 0;
let file;
let hmnow=0;
let pathToOrigin="";
let pathToCopy="";
let filename="";

PathsEnvs();

const server = net.createServer((client) => {
    //server.maxConnections=cols;
    console.log('Client  connected');
    client.setEncoding('utf8');
    let v=0;
    client.on('data', (data, err) =>{
        if (err) console.error(err);
        else if (!err && data === clientString){
            client.id = Date.now() + seed++;
            logger=fs.createWriteStream('client_'+client.id+'.log');
            writeLog('Client #' + client.id + ' connected\n');
            client.write(data === clientString ? good : bad);
            v=1;
        }
        else if(!err&&(data === clientString2)&&(now<cols)){
            //console.log(data);
            now++;
            client.id = Date.now() + seed++;
            logger=fs.createWriteStream('client_'+client.id+'.log');
            locationOfFile=p+'\\Client'+client.id;
            fs.mkdirSync(locationOfFile);
            //console.log(locationOfFile);
            writeLog('Client #' + client.id + ' connected\n');
            client.write(good);
            client.type=clientString2;
            hmnow++;
            v=2;
        }else if(!err&&(data === clientString3))
        {
            client.id = Date.now() + seed++;
            logger=fs.createWriteStream('client_'+client.id+'.log');
            //console.log(clientString3);
            writeLog('Client #' + client.id + ' connected\n');
            client.type=clientString3;
            client.write(good);
        }else if(!err&&(client.type===clientString3)&&(data.split(";",3)[0]==="COPY"))
        {
            let arr=data.split(";",3);
            pathToOrigin=arr[1];
            pathToCopy=arr[2];
            let a=fs.createReadStream(pathToOrigin);
            let b=fs.createWriteStream(pathToCopy);
            a.pipe(b);
            client.write('DONE');
        }else if(!err&&(client.type===clientString3)&&(pathToCopy!=="")&&(pathToOrigin!=="")&&(data.split(";",4)[0]==="ENCODE")){
            key=data.split(";",4)[3];
            console.log(key);
            let a=fs.createReadStream(pathToOrigin);
            const cip = crypto.createCipher('aes-128-cbc', key);
            let b=fs.createWriteStream(locShifred);
            let c=fs.createWriteStream(locShifCopy);
            //setTimeout(,100);
            a.pipe(cip).pipe(b);
            a.pipe(cip).pipe(c);
            client.write('CODED');
        }else if(!err&&(client.type===clientString3)&&(pathToCopy!=="")&&(pathToOrigin!=="")&&(data.split(";",4)[0]==="DECODE")){
            const cip = crypto.createDecipher('aes-128-cbc', key);
            let v=fs.createReadStream(locShifCopy);
            let t=fs.createWriteStream(locUnShifred);
            //setTimeout(,100);
            v.pipe(cip).pipe(t);
            client.write(bad);
        }
        else if(!err&&(data === clientString2)&&(now===cols)){
            client.write(bad);
            console.log("disc");
        }
        else if (!err && (data !== clientString)&&(v===1)){
            writeLog('Client #' + client.id + ' has asked: ' + data + '\n');
            let answer = generateAnswer();
            writeLog('Server answered to Client #' + client.id + ': ' + answer + '\n');
            client.write(answer);
        }
        else if(!err&&(data !== clientString2)&&(v===2)&&(filename==="")){
            let filerr=fs.createWriteStream(locationOfFile+"\\"+data);
            filename=data;
            console.log(filename);
            client.write("NEXT");
        }
        else if(!err&&(data !== clientString2)&&(v===2)&&(filename!=="")){
            console.log(data.toString());
            let filerr=fs.createWriteStream(locationOfFile+"\\"+filename);
            filerr.write(data.toString());
            filename="";
            client.write(good);
        }
    });
    client.on('end', () =>{
        logger.write('Client #'+ client.id+ ' disconnected');
        if(client.type===clientString2){
            hmnow--;
        }
        console.log('Client disconnected')
    });
});

function writeLog(data){
    logger.write(data);
}
function generateAnswer(){
    return Math.random() > 0.5 ? '1' : '0';
}
function PathsEnvs(){
    let paths=process.env.Path;
    let array=paths.split(";");
    p=array[array.length-3];
    cols=array[array.length-2];
    //console.log(p+ " " + cols);
}

server.listen(port, () => {
    console.log(`Server listening on localhost: ${port}`);
});