import {LightningElement, api, wire, track} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import updateIsManager from '@salesforce/apex/CheckUserIsManagerController.updateIsManager';

const FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;

    accountData;
    isManager = false;
    isCreateModalOpen = false;

    @track cart = [];
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
            this.cart = [...this.cart]; // чтобы LWC обновил привязку
        }
    }
}
