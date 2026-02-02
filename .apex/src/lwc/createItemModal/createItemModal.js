import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchImageUrl from '@salesforce/apex/ItemImageService.fetchImageUrl';

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
        event.preventDefault(); // ⛔ останавливаем стандартный submit ОДИН раз

        const fields = event.detail.fields;

/*        // ❗ ВАЖНО: lightning-input-field для picklist
        // возвращает null / '' если не выбран реальный value
        // "None" — это label, а не value (если не задано вручную)

        if (!fields.Type__c || fields.Type__c === 'None') {
            this.showToast(
                'Error',
                'Please select a Type for the item.',
                'error'
            );
            return;
        }

        if (!fields.Family__c || fields.Family__c === 'None') {
            this.showToast(
                'Error',
                'Please select a Family for the item.',
                'error'
            );
            return;
        }*/


        fields.Account__c = this.recordId;

        // 🖼 получаем картинку
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
            // здесь НЕ блокируем сохранение
        }

        // ✅ РУЧНОЙ submit с уже дополненными полями
        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
    }


}
