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

    @track selectedItem;
    @track isDetailsModalOpen = false;

    @track cart = []; // { item: Item__c, quantity: number }

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

    handleShowDetails(event) {
        this.selectedItem = event.detail;
        this.isDetailsModalOpen = true;
    }

    handleCloseDetails() {
        this.isDetailsModalOpen = false;
        this.selectedItem = null;
    }

    updateCart() {
        this.dispatchEvent(new CustomEvent('cartupdate', { detail: this.cart }));
    }

    handleAddToCart(event) {
        const selectedItem = event.detail; // объект Item__c
        console.log('------------------selectedItem:', selectedItem);

        const index = this.cart.findIndex(c => c.item.Id === selectedItem.Id);
        if (index > -1) {
            this.cart[index].quantity += 1;
        } else {
            this.cart.push({ item: selectedItem, quantity: 1 });
        }

        this.updateCart();
    }
}
