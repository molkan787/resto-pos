export default {
    orderType({ order_type, order_details }){
        console.log(order_type)
        if(order_type == 'table' && order_details.table){
            return `Table (${order_details.table})`;
        }else{
            return order_type.capitalize();
        }
    }
}

