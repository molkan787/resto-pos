const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ClientController = require('./client_controller');
const AdminController = require('./admin_controller');
const Security = require('./security');

const PORT = 8095;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    try {
        const { pathname } = req._parsedUrl;
        if(['/admin/auth', '/client/auth', '/client/get_db_dump', '/client/updates'].includes(pathname)){
            next();
            return;
        }
        const token = req.headers['authorization'];
        const data = Security.getTokenData(token);
        if(data == '@admin'){
            next();
            return;
        }
    } catch (error) {
        
    }
    res.status(401).send('Unauthorized');
});

app.post('/client/auth', ClientController.auth);
app.get('/client/get_db_dump', ClientController.get_db_dump);
app.get('/client/updates', ClientController.get_updates);

app.get('/admin/vendors', AdminController.get_vendors);
app.post('/admin/vendor/:vendor_id', AdminController.edit_vendor);

app.post('/admin/auth', AdminController.auth);
app.get('/admin/check', AdminController.check);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`)
})