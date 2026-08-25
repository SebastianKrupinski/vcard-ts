import { VPropertyBaseInterface, VPropertyCollectionInterface } from "./VPropertyInterfaces";

export class VPropertyCollection extends Array<VPropertyBaseInterface> implements VPropertyCollectionInterface {

    constructor(properties: VPropertyBaseInterface[] | VPropertyBaseInterface | null = []) {
        if (Array.isArray(properties)) {
            super(...properties)
        } else if (properties) {
            super(properties)
        } else {
            super()
        }
    }

}