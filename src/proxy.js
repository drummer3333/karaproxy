var zlib = require('zlib');
var http = require('http');
var httpProxy = require('http-proxy');
var modifyResponse = require('http-proxy-response-rewrite');

// Create a proxy server
var proxy = httpProxy.createProxyServer({
    target: {
        protocol: 'https:',
        host: 'www.karafun.de',
        port: 443
    },
    //selfHandleResponse : true,
    changeOrigin: true,
});

// Listen for the `proxyRes` event on `proxy`.
proxy.on('proxyRes', function (proxyRes, req, res) {

    if (req.url.includes('type=song_list')) {
        modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
            if (body) {
                // modify some information
                var modifiedBody = JSON.parse(body);
                modifiedBody.songs = modifiedBody.songs.filter((song) => {
                    if (song.artist.id != 5223 //Helene Fischer 
                        && song.id != 19346 // 1001 Nacht
                        && song.id != 45873 // Let it go frozen
                        && song.id != 45761 // Let it go Demi
                        && song.id != 52471 // Let it go Jazz
                        && song.id != 47597 // Let it go Dance
                       ) {
                        return true;
                    } else {
                        //console.log(song.name + ' - ' + song.artist.name);
                        return false;
                    }
                
                });
                modifiedBody.count = modifiedBody.songs.length;
                return JSON.stringify(modifiedBody);
            }
            return body;
        });
    }
});

proxy.on('error', function (err, req, res) {
    console.log(err)
});
  

// Create your server and then proxies the request
var server = http.createServer(function (req, res) {
    proxy.web(req, res);
}).listen(8080);


