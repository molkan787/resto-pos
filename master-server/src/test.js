const VendorsDBs = require('./vendors_dbs');
const Security = require('./security');
const Vendors = require('./vendors');

async function run(){
    // console.log(Security.generateToken('foobar', 60));
    // console.log(Security.getTokenData('Y2UzYWQ3NGM1ZjM2OTk4MDRjNmZhNGFlM2M5MDBlZjM6MTU5NDgzNDkxOTpmb29iYXI='))
    
    // await Vendors.createVendor({
    //     vendor_name: 'Marcho Food Inc',
    //     vendor_address: '720 main street, City Name',
    //     vendor_phone: '',
    //     owner_fullname: '',
    //     admin_password: 'foobar'
    // })

    console.log(await Vendors.authVendorAdmin('marcho-food-inc-4', 'foobar'));
    process.exit(0);
}

run();