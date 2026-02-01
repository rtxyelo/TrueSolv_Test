import { LightningElement, api, wire, track } from 'lwc';
import getItems from '@salesforce/apex/ItemService.getItems';
import getFamilies from '@salesforce/apex/ItemService.getFamilies';
import getTypes from '@salesforce/apex/ItemService.getTypes';

export default class ItemList extends LightningElement {
    @api recordId;
    @track items;
    @track isLoading = true;
    @track itemsCount = 0;

    @track selectedFamily = '';
    @track selectedType = '';
    @track searchKey = '';

    @track familyOptions = [];
    @track typeOptions = [];

    connectedCallback() {
        this.loadPicklistOptions(getFamilies, 'familyOptions');
        this.loadPicklistOptions(getTypes, 'typeOptions');
    }

    loadPicklistOptions(apexMethod, property) {
        apexMethod()
            .then(data => {
                this[property] = [{ label: 'All', value: '' }, ...data.map(item => ({ label: item, value: item }))];
            })
            .catch(error => {
                console.error(`Error loading ${property}:`, error);
            });
    }

    @wire(getItems, { family: '$selectedFamily', type: '$selectedType', searchKey: '$searchKey' })
    wiredItems({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.items = data;
            this.itemsCount = data.length;
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.items = [];
            this.itemsCount = 0;
            this.isLoading = false;
        }
    }

    handleFamilyChange(event) {
        this.selectedFamily = event.detail.value;
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
    }
}
