import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchImageUrl from '@salesforce/apex/ItemImageService.fetchImageUrl';
import checkItemName from '@salesforce/apex/ItemService.checkItemName';

export default class CreateItemModal extends LightningElement {
    @api recordId;
    isSaveDisabled = true;
    isSubmitting = false;
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

    handleFieldChange(event) {
        if (!event || this.isSubmitting) {
            return;
        }

        const fieldName = event.target.fieldName;
        const value = event.detail.value;

        this.formState = {
            ...this.formState,
            [fieldName]: value
        };

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

    async submitForm() {
        if (this.isSubmitting) {
            return;
        }

        console.log("submitForm-=-=-=-=-=-=-=-=-=-=-");

        this.isSubmitting = true;
        this.isSaveDisabled = true;

        const fields = {
            Name: this.formState.Name,
            Description__c: this.formState.Description__c,
            Type__c: this.formState.Type__c,
            Family__c: this.formState.Family__c,
            Price__c: this.formState.Price__c,
            Account__c: this.recordId
        };

        try {
            const exists = await checkItemName({ name: fields.Name });
            if (exists) {
                this.showToast('Error', 'An item with this Name already exists.', 'error');
                this.isSubmitting = false;
                this.isSaveDisabled = false;
                return;
            }
        } catch (e) {
            this.showToast('Error', 'Unable to check item name.', 'error');
            this.isSubmitting = false;
            this.isSaveDisabled = false;
            return;
        }

        try {
            const imageUrl = await fetchImageUrl({ itemName: fields.Name });
            if (imageUrl) {
                fields.Image__c = imageUrl;
            }
        } catch (e) {
            console.warn(e);
        }

        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
    }


    handleError(event) {
        console.error('Save error:', event.detail);

        let message = 'Item with same name already exist!';

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
