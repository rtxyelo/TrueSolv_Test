import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchImageUrl from '@salesforce/apex/ItemImageService.fetchImageUrl';
import checkItemName from '@salesforce/apex/ItemService.checkItemName';

export default class CreateItemModal extends LightningElement {
    @api recordId;
    isSaveDisabled = true;
    formState = {
        Name: null,
        Description__c: null,
        Price__c: null,
        Type__c: null,
        Family__c: null
    };


    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    renderedCallback() {
        this.handleFieldChange();
    }

    handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const value = event.detail.value;

        this.formState[fieldName] = value;

        const { Name, Description__c, Price__c, Type__c, Family__c } = this.formState;

        this.isSaveDisabled = !(
            Name &&
            Description__c &&
            Price__c &&
            Type__c &&
            Family__c
        );
    }


    getFieldValue(fieldName) {
        const field = this.template.querySelector(
            `lightning-input-field[field-name="${fieldName}"]`
        );
        return field ? field.value : null;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Item created successfully',
                variant: 'success'
            })
        );

        this.dispatchEvent(new CustomEvent('itemsuccess'));
    }

    async handleSubmit(event) {
        this.isSaveDisabled = true;
        event.preventDefault();
        const fields = event.detail.fields;

        try {
            const exists = await checkItemName({ name: fields.Name });
            if (exists) {
                this.showToast('Error', 'An item with this Name already exists.', 'error');
                this.isSaveDisabled = false;
                return; // останавливаем сабмит
            }
        } catch (error) {
            console.error('Error checking item name:', error);
            this.showToast('Error', 'Unable to check item name.', 'error');
            this.isSaveDisabled = false;
            return;
        }

        fields.Account__c = this.recordId;

        try {
            const imageUrl = await fetchImageUrl({
                itemName: fields.Name
            });
            console.log('Unsplash URL:', imageUrl);
            if (imageUrl) {
                fields.Image__c = imageUrl;
            }
        } catch (error) {
            console.error('Unsplash error:', error);
        }

        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);

        this.isSaveDisabled = false;
    }

    handleError(event) {
        console.error('Save error:', event.detail);

        let message = 'Item with same name already exist!';

        // Duplicate / Validation error
        if (event.detail && event.detail.message) {
            message = event.detail.message;
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Save failed',
                message,
                variant: 'error'
            })
        );
    }

}
