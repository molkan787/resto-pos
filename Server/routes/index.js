const asd = require('./asd');
const auth = require('./auth');
const order = require('./order');
const orders = require('./orders');
const refundOrder = require('./refundOrder');
const prepaid = require('./prepaid');
const getPrepaids = require('./getPrepaids');
const getLoyalty = require('./getLoyalty');
const loyalty = require('./loyalty');
const capture = require('./capture');
const clcref = require('./clcref');
const client = require('./client');
const editClient = require('./editClient');
const delClient = require('./delClient');
const clients = require('./clients');
const users = require('./users');
const user = require('./user');
const delUser = require('./delUser');
const product = require('./product');
const delProduct = require('./delProduct');
const reports = require('./reports');
const download = require('./download');
const setReceiptFlag = require('./setReceiptFlag');
const settings = require('./settings');
const editCardBalance = require('./editCardBalance');
const editCardBarcode = require('./editCardBarcode')
const importData = require('./import');
const exportData = require('./export');
const StatsWebPage = require('./stats');
const category = require('./category');
const cashout = require('./cashout');
const pos = require('./pos');
const dailyStats = require('./dailyStats');
const stocks = require('./stocks');
const { createOffer, updateOffer, deleteOffer } = require('./offers');
const bookings = require('./bookings');
const bookingSlots = require('./booking_slots');
const bookedSlots = require('./booked_slots');
const bookingTables = require('./booking_tables');

module.exports = server => {
    server.get('/stats', StatsWebPage);
    server.post('/stats', StatsWebPage);
    server.get('/asd', asd);
    // server.get('/client_history/:phone', clientHistory);
    server.get('/clcref/:by/:ref', clcref);
    server.get('/client/:by/:ref', client);
    server.get('/download/:filename/:signature/:returnFilename', download);
    server.get('/settings', settings.get);

    server.post('/clients', clients);
    server.post('/orders', orders);
    server.post('/prepaid/get', getPrepaids);
    server.post('/loyalty/get', getLoyalty);
    server.post('/users', users);
    server.post('/user', user);
    server.post('/setReceiptFlag', setReceiptFlag);

    server.post('/reports', reports);
    server.post('/auth', auth);
    server.post('/order', order);
    server.post('/product', product);
    server.post('/prepaid/:action', prepaid);
    server.post('/loyalty/:action', loyalty);
    server.post('/capture/:method', capture);
    server.post('/client', editClient);
    server.post('/settings', settings.set);
    server.post('/editCardBalance', editCardBalance);
    server.post('/editCardBarcode', editCardBarcode);
    server.post('/order/refund', refundOrder);

    server.post('/import/:dest', importData);
    server.post('/export/:dataName', exportData);

    server.del('/product/:id', delProduct);
    server.del('/user/:id', delUser);
    server.del('/client/:id', delClient);

    server.post('/category/edit', category.edit);
    server.del('/category/:id', category.delete);

    server.post('/cashout', cashout);

    server.get('/pos/get_order/:id', pos.get);
    server.post('/pos/edit_order/:id', pos.edit);

    server.get('/daily-stats/:day', dailyStats);
    server.get('/stocks', stocks);

    server.post('/offers', createOffer);
    server.put('/offers/:id', updateOffer);
    server.del('/offers/:id', deleteOffer);

    server.get('/bookings', bookings.find);
    server.post('/bookings', bookings.create);
    server.put('/bookings/:id', bookings.update);
    server.del('/bookings/:id', bookings.delete);
    server.put('/bookings/sync', bookings.sync);

    server.put('/booking_slots', bookingSlots.put);

    server.get('/booked_slots', bookedSlots.get);

    server.get('/booking-tables/booked-tables', bookingTables.getBookedTables);

};