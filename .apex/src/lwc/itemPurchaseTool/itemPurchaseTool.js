import {LightningElement, api, wire, track} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import updateIsManager from '@salesforce/apex/CheckUserIsManagerController.updateIsManager';
import checkout from '@salesforce/apex/PurchaseService.checkout';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

const FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends NavigationMixin(LightningElement) {
    @api recordId;

    accountData;
    isManager = false;
    isCreateModalOpen = false;

    @track cart = []; // { item: Item__c, quantity: number }
    @track isCartOpen = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            this.accountData = {
                name: data.fields.Name.value,
                number: data.fields.AccountNumber.value,
                industry: data.fields.Industry.value
            };
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        updateIsManager()
            .then(result => {
                this.isManager = result;
            })
            .catch(error => {
                console.error('Error updating IsManager:', error);
            });

        console.log('recordId:', this.recordId);
    }

    handleOpenCreateItem() {
        try {
            this.isCreateModalOpen = true;
        } catch (error) {
            console.error('Error opening Create Item modal:', error);
        }
    }

    handleCloseCreateItem() {
        this.isCreateModalOpen = false;
    }

    handleItemCreated() {
        this.isCreateModalOpen = false;
        // позже здесь будет refresh items
    }

    handleCartUpdate(event) {
        console.log('===============event.detail:', event.detail);
        this.cart = [...event.detail]; // обновляем cart
        // this.cart = event.detail;
    }

    handleShowCart() {
        this.isCartOpen = true;
    }

    handleCloseCart() {
        this.isCartOpen = false;
    }

    handleRemoveOne(event) {
        const itemId = event.detail;
        const index = this.cart.findIndex(c => c.item.Id === itemId);
        if (index > -1) {
            this.cart[index].quantity -= 1;
            if (this.cart[index].quantity <= 0) {
                this.cart.splice(index, 1);
            }
            this.cart = [...this.cart];
        }
    }

    handleCheckOut() {
        const dtoCart = this.cart.map(c => ({
            itemId: c.item.Id,
            quantity: c.quantity,
            price: c.item.Price__c
        })); // { item: Item__c, quantity: number }

        console.log('===============CART ITEM Id:', this.cart[0].item.Id);
        console.log('===============CART ITEM quantity:', this.cart[0].quantity);
        console.log('===============CART ITEM Price__c:', this.cart[0].item.Price__c);
        console.log('===============dtoCart ITEM ID:', dtoCart[0].itemId);
        console.log('===============dtoCart ITEM ID:', dtoCart[0].quantity);
        console.log('===============dtoCart ITEM ID:', dtoCart[0].price);

        console.log(JSON.stringify(dtoCart, null, 2));

        const dtoCartJson = JSON.stringify(dtoCart);

        const accId = this.recordId;

        checkout({ accountId: accId, cartItemsJson: dtoCartJson })
            .then(result => {
                // result = Id созданной Purchase__c
                console.log('NAVIGATE TO ID:', result, typeof result);

                this.showToast('Success', 'Purchase created successfully', 'success');

                // // Навигация на страницу Purchase
                // this[NavigationMixin.Navigate]({
                //     type: 'standard__recordPage',
                //     attributes: {
                //         recordId: result,
                //         objectApiName: 'Purchase__c',
                //         actionName: 'view'
                //     }
                // });

                // this[NavigationMixin.GenerateUrl]({
                //     type: 'standard__recordPage',
                //     attributes: {
                //         recordId: result,
                //         objectApiName: 'Purchase__c',
                //         actionName: 'view'
                //     }
                // }).then(url => {
                //     window.location.assign(url);
                // });

                window.location.href = '/' + result;

            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
