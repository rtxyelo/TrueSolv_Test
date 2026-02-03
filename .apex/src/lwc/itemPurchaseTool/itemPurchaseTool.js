import {LightningElement, api, wire, track} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import hasManagerAccess from '@salesforce/apex/CheckUserIsManagerController.hasManagerAccess';
import checkout from '@salesforce/apex/PurchaseService.checkout';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';

const FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends NavigationMixin(LightningElement) {
    @api recordId;

    accountData;
    isAccountData = false;
    isManager = false;
    isCreateModalOpen = false;

    @track cart = []; // { item: Item__c, quantity: number }
    @track isCartOpen = false;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference?.state?.c__recordId) {
            this.recordId = currentPageReference.state.c__recordId;
        } else {
            this.recordId = null;
            this.accountData = null;
            this.isAccountData = false;
        }
    }


    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            console.log('Account data loaded', data);
            this.accountData = {
                name: data.fields.Name.value,
                number: data.fields.AccountNumber.value,
                industry: data.fields.Industry.value
            };
            this.isAccountData = true;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        hasManagerAccess()
            .then(result => {
                this.isManager = result;
                console.log('Is Manager:', this.isManager);
            })
            .catch(error => {
                console.error('Error updating IsManager:', error);
            });

        console.log('recordId:', this.recordId);
    }

    handleOpenCreateItem() {
        if (!this.isManager) {
            this.showToast(
                'Access denied',
                'Only managers can create items',
                'error'
            );
            return;
        }

        this.isCreateModalOpen = true;
    }


    handleCloseCreateItem() {
        this.isCreateModalOpen = false;
    }

    handleItemCreated() {
        this.isCreateModalOpen = false;
        // позже здесь будет refresh items
    }

    handleCartUpdate(event) {
        this.cart = [...event.detail];
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
        this.isCartOpen = false;

        const dtoCart = this.cart.map(c => ({
            itemId: c.item.Id,
            quantity: c.quantity,
            price: c.item.Price__c
        })); // { item: Item__c, quantity: number }

        const dtoCartJson = JSON.stringify(dtoCart);
        console.log(dtoCartJson);

        const accId = this.recordId;

        checkout({ accountId: accId, cartItemsJson: dtoCartJson })
            .then(result => {
                this.showToast('Success', 'Purchase created successfully', 'success');

                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Purchase__c',
                        actionName: 'view'
                    }
                });
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

    get accountId() {
        return this.recordId;
    }
}
