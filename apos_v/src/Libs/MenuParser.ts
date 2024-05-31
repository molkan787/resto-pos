import { MurewCategory, MurewCategoryContentType } from "@/interfaces/murew/MurewCategory"
import { MurewProduct } from "@/interfaces/murew/MurewProduct"
import { randomString, slugify } from "@/utils"

export class MenuParser{

    static parseFromText(text: string){
        const lines = text.split('\n')
        const categories = []
        const lonelyProducts = []
        let currentCategory = null
        for(let i = 0; i < lines.length; i++){
            const line = lines[i].trim()
            if(line.startsWith('#')){
                if(currentCategory){
                    categories.push(currentCategory)
                }
                currentCategory = this.craftCategory(line.substring(1).trim())
            }else if(line.length >= 6){
                const items = this.parseProductLine(line)
                const products = items.map(item => this.craftProduct(item))
                if(currentCategory){
                    currentCategory.childs.push(...products)
                }else{
                    lonelyProducts.push(...products)
                }
            }
        }
        if(currentCategory){
            categories.push(currentCategory)
        }
        return {
            categories,
            lonelyProducts
        }
    }

    private static parseProductLine(line){
        const words = line.split(' ')
        const items = []
        let names = [] 
        for(let i = 0; i < words.length; i++){
            const word = words[i].trim()
            if((i === 0 && /[0-9]/.test(word.charAt(0))) || word.length === 1){
                continue
            }
            if(/[a-zA-Z()]/.test(word.charAt(0))){ // it's a name
                names.push(word)
            }else{ // it's the price
                items.push({
                    name: names.join(' '),
                    price: word
                })
                names = names.slice(0, names.length - 1)
            }
        }
        return items
    }

    private static parsePrice(priceText: string){
        if(!/[0-9]/.test(priceText.charAt(0))){
            return parseFloat(priceText.substring(1))
        }else{
            return parseFloat(priceText)
        }
    }

    private static craftProduct(info: { name: string, price: string }){
        return {
            id: 'new',
            category_id: 0,
            name: info.name.trim(),
            price:this.parsePrice(info.price),
            stock_enabled: 0,
            stock: 0,
            can_exclude_taxes: 0,
            product_type: 1,
            contains_allergens: 0,
            sort_no: 0,
            date_modified: 0
        }
    }

    private static craftCategory(displayName: string){
        return {
            id: 'new',
            parent_id: 0,
            childs_type: 0,
            name: displayName,
            icon: '',
            ctype: 1,
            sort_no: 0,
            date_modified: 0,
            childs: []
        }
    }

}

// @ts-ignore
window.MenuParser = MenuParser