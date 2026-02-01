import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import updateIsManager from '@salesforce/apex/CheckUserIsManagerController.updateIsManager';

const FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;

    accountData;
    isManager = false;
    isCreateModalOpen = false;

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
        this.isCreateModalOpen = true;
    }

    handleCloseCreateItem() {
        this.isCreateModalOpen = false;
    }

    handleItemCreated() {
        this.isCreateModalOpen = false;
        // позже здесь будет refresh items
    }
}
