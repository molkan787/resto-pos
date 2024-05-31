import utils from './utils';
import comu from './comu';
import Vue from 'vue';
import { services } from '@/services';
const postData = utils.postData;
const deleteData = utils.deleteData;

export default class DS{

    private static context: any;

    static setup(context: any){
        this.context = context;
    }

    static editUser(data: any){
        return new Promise((resolve, reject) => {
            postData('user', data).then((res: any) => {
                this.updateLocalUser(data, res.data);
                resolve(true);
            }).catch(error => {
                reject(error);
            })
        });
    }

    static deleteUser(userId: any){
        return new Promise((resolve, reject) => {
            deleteData(`user/${userId}`).then((res: any) => {
                this.removeLocalUser(userId);
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }

    static deleteProduct(product_id: any){
        return new Promise((resolve, reject) => {
            deleteData(`product/${product_id}`).then((res: any) => {
                this.removeLocalProduct(product_id);
                resolve(true);
                services.onMenuChanged();
            }).catch(error => {
                reject(error);
            });
        });
    }

    static editProduct(data: any){
        this.prepareProductData(data);
        return new Promise((resolve, reject) => {
            postData('product', data).then((res: any) => {
                this.updateLocalProduct(data, res.data);
                resolve(true);
                services.onMenuChanged();
            }).catch(error => {
                reject(error);
            });
        });
    }

    static updateLocalProduct(data: any, rdata: any){
        if(data.id == 'new'){
            rdata.price = utils.mapPrice(rdata.price);
            this.context.dispatch('addProduct', rdata);
        }else{
            const p = this.context.state.productsByIds[data.id];
            p.name = data.name;
            p.product_type = data.product_type;
            p.stock_enabled = data.stock_enabled;
            p.stock = data.stock;
            p.price = utils.mapPrice(data.price);
            p.sort_no = data.sort_no;
        }
    }

    static removeLocalProduct(product_id: any){
        const p = this.context.state.productsByIds[product_id];
        const cat_id = p.category_id + '';
        const cat: any[] = this.context.state.products[cat_id];
        const index = cat.indexOf(p);
        cat.splice(index, 1);
    }

    static removeLocalUser(userId: any){
        const users = this.context.state.data.users;
        let user = users.filter((u: any) => u.id == userId);
        user = user.length ? user[0] : null;
        if(user){
            const index = users.indexOf(user);
            users.splice(index, 1);
        } 
    }

    static updateLocalUser(data: any, rdata: any){
        if(data.id == 'new'){
            this.context.state.data.users.unshift(rdata);
        }else{
            const user = comu.getUser(data.id);
            if(user){
                user.username = data.username;
                user.first_name = data.first_name;
                user.last_name = data.last_name;
                user.user_type = data.user_type;
            }
        }
    }

    static async editCategory(data){
        const srcId = data.id;
        const resp: any = await postData('category/edit', data);
        const state = this.context.state;
        if(srcId == 'new'){
            const cat = resp.data;
            const { id, parent_id } = cat;
            Vue.set(state.categoriesByIds, id, cat);
            Vue.set(state.products, id, []);
            if(parent_id){
                const parent = state.categoriesByIds[parent_id];
                parent.childs.push(cat);
            }else{
                Vue.set(cat, 'childs', []);
                state.categories.push(cat);
            }
            state.allCategories.push(cat);
        }else{
            const cat = state.categoriesByIds[srcId];
            cat.ctype = data.ctype;
            cat.name = data.name;
            cat.sort_no = data.sort_no;
        }
        services.onMenuChanged();
        return true;
    }

    static async addBulkCategories(items){
        const state = this.context.state;
        for(let item of items){
            const { childs, ...itemData } = item
            const resp: any = await postData('category/edit', itemData);
            const cat = resp.data;
            const { id, parent_id } = cat;
            Vue.set(state.categoriesByIds, id, cat);
            Vue.set(state.products, id, []);
            if(parent_id){
                const parent = state.categoriesByIds[parent_id];
                parent.childs.push(cat);
            }else{
                Vue.set(cat, 'childs', []);
                state.categories.push(cat);
            }
            state.allCategories.push(cat);
            for(let product of item.childs){
                product.category_id = cat.id
                this.prepareProductData(product);
                const res: any = await postData('product', product)
                this.updateLocalProduct(product, res.data);
            }
        }
        services.onMenuChanged();
        return true;
    }

    static async deleteCategory(data){
        await deleteData('category/' + data.id);
        const state = this.context.state;
        const { id, parent_id } = data;
        state.categoriesByIds[id] = null;
        if(parent_id){
            const parent = state.categoriesByIds[parent_id];
            const index = parent.childs.indexOf(data);
            parent.childs.splice(index, 1);
        }else{
            const index = state.categories.indexOf(data);
            state.categories.splice(index, 1);
        }
        const index = state.allCategories.indexOf(data);
        state.allCategories.splice(index, 1);
        services.onMenuChanged();
        return true;
    }

    // --------------------------------

    static prepareProductData(data: any){
        if(parseInt(data.product_type) == 2){
            data.price = 0;
        }else{
            data.price = utils.preparePrice(data.price);
        }
    }

}
