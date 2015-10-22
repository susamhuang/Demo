var PORT = 33333;
var HOST = '127.0.0.1';
 var fs = require('fs');
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
//var response = require('getResponse');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);

});

server.on('message', function (message, remote) {
  //  console.log(remote.address + ':' + remote.port +' - ' + message);

    // here, check message from client to decide which response data should be used to return to STB

    // default encoding is utf8
    if (typeof (encoding) == 'undefined') encoding = 'utf8';
    // read file synchroneously
    var filename = __dirname + '/response.json';
    var contents = fs.readFileSync(filename, encoding);
    // parse response contents as JSON
    var dataObj = JSON.parse(contents);
    
    var url = dataObj.xmlURL;   
    var urlLen = url.lenght;
    
    //put payload data into buffer
    var buf = new Buffer(10 + urlLen);
    buf[0] = dataObj.CmdVer;
    buf[4] = dataObj.platform_profile;
    buf[6] = dataObj.xml_file_version_major;
    buf[7] = dataObj.xml_file_version_minor;
    buf[8] = urlLen; 
    buf[10] = url;

    console.log(buf);

    //calculate CRC of playload
    var playloadCRC = require('crc');

	var checksum = playloadCRC.crc32(buf.toString());
    
    //concat payload buffer and checksum buffer and send to client
	var response_data = Buffer.concat([buf, new Buffer(checksum)]);

    console.log('reponse buff data:', response_data);
    server.send(
            response_data,
            0, // Buffer offset
            dataObj.length,
            remote.port,
            remote.address,
            function( error, byteLength ) {
 
                console.log( "... Sent response to " + remote.address + ":" + remote.port );
 
            }
    );

});


server.on("error", function ( error ) {
 		console.log('UDP Server err on, server will be closed! ');
        server.close();
 
    }
);


server.bind(PORT, HOST);