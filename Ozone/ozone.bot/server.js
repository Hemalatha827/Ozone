const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const searchRoutes = require('./routes/searchRoute');


// Use routes
app.use('/search', searchRoutes);


// Create server
const server = http.createServer(app);
const port = 8080;
server.listen(port, () => {
    console.debug('Server listening on port ' + port);
});
