import { LightningElement, api } from 'lwc';

export default class ItemTile extends LightningElement {
    @api item;
    @api isAccountData;

    get canAddToCart() {
        console.log("isAccountData", this.isAccountData);
        return this.isAccountData === true;
    }

    handleDetails() {
        this.dispatchEvent(new CustomEvent('showdetails', { detail: this.item }));
    }

    handleAddToCart() {
        this.dispatchEvent(new CustomEvent('addtocart', { detail: this.item }));
    }
}
