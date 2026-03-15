const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'login.html' : req.url);

    const ext = path.extname(filePath);
    let contentType = 'text/html';

    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.json') contentType = 'application/json';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

let currentPort = Number(process.env.PORT) || 8000;

function startServer(port) {
    server.listen(port, () => {
        console.log(`Frontend running at http://localhost:${port}/login.html`);
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const nextPort = currentPort + 1;
        console.warn(`Port ${currentPort} is already in use. Retrying on ${nextPort}...`);
        currentPort = nextPort;
        startServer(currentPort);
        return;
    }

    throw err;
});

startServer(currentPort);