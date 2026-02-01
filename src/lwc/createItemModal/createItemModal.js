import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateItemModal extends LightningElement {

    close() {
        this.dispatchEvent(new CustomEvent('close'));
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

    handleSubmit(event) {
        // event.detail.fields содержит все значения полей формы
        const fields = event.detail.fields;

        if (!fields.Type__c || fields.Type__c === 'None') {
            event.preventDefault(); // предотвращаем сохранение
            this.showToast('Error', 'Please select a Type for the item.', 'error');
            return;
        }

        if (!fields.Family__c || fields.Family__c === 'None') {
            event.preventDefault(); // предотвращаем сохранение
            this.showToast('Error', 'Please select a Family for the item.', 'error');
            return;
        }

        // если все ок, форма продолжает сабмититься
    }

}
