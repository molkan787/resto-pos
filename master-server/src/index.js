const express = require('express');
const bodyParser = require('body-parser');
const ClientController = require('./client_controller');

const PORT = 80;
const app = express();

app.use(bodyParser.json());

app.post('/client/auth', ClientController.auth);
app.get('/client/get_db_dump', ClientController.get_db_dump);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`)
})
