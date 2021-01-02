export abstract class ServiceHooks{

    /**
     * Hook called after the initial data of the POS was loaded
     * @param data 
     */
    public abstract onDataLoaded(data): Promise<any>;

    /**
     * Hook called after menu was changed (edited by the user)
     */
    public abstract onMenuChanged(): Promise<any>;

    /**
     * Hook called after an order was posted/submited
     * @param order 
     */
    public abstract onOrderPosted(order): Promise<any>;

}