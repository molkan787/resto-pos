export default class Categories{

    static mapCategories(categories){
        const byIdsMap = {};
        const map = {};
        const parents = [];
        for(let category of categories){
            const { id, parent_id } = category;
            category.childs = [];
            byIdsMap[id] = category;
            if(parent_id > 0){
                if(typeof map[parent_id] != 'object')
                    map[parent_id] = [category];
                else
                    map[parent_id].push(category);
            }else{
                parents.push(category);
            }
        }
        for(let parent of parents){
            parent.childs = map[parent.id] || [];
        }
        return {
            byIds: byIdsMap,
            list: parents,
        };
    }

}