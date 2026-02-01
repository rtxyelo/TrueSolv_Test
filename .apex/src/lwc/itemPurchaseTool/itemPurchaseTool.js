import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import updateIsManager from '@salesforce/apex/CheckUserIsManagerController.updateIsManager';

const FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;
    accountData;
    isManager = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        updateIsManager()
            .then(result => {
                this.isManager = result;
            })
            .catch(error => {
                console.error('Error updating IsManager:', error);
            });

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
        console.log('recordId:', this.recordId);

    }


}