import { LightningElement, api } from 'lwc';

export default class ItemDetailsModal extends LightningElement {
    @api item;

    closeModal() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
