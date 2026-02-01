import { LightningElement, api } from 'lwc';

export default class AccountInfo extends LightningElement {
    @api account;
    @api isManager;

    get createItemDisabled() {
        return !this.isManager;
    }

    handleCreateItemClick() {
        this.dispatchEvent(new CustomEvent('createitem'));
    }
}
