import { LightningElement, api, track } from 'lwc';

export default class CartModal extends LightningElement {
    @api cartItems = []; // массив объектов { item: Item__c, quantity: number }

    get totalQuantity() {
        return this.cartItems.reduce((sum, c) => sum + c.quantity, 0);
    }

    get totalCost() {
        return this.cartItems.reduce((sum, c) => sum + c.quantity * c.item.Price__c, 0);
    }

    get cartItemsWithTotal() {
        return this.cartItems.map(c => ({
            ...c,
            total: c.item.Price__c * c.quantity
        }));
    }

    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    removeOne(event) {
        const itemId = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('removeone', { detail: itemId }));
    }

    purchaseCart() {
        // this.close();
        this.dispatchEvent(new CustomEvent('checkout'));
    }
}
