import { VPropertyCollectionInterface } from "./properties/VPropertyInterfaces"

export enum VCardPropertyVersionValues {
	V2_1 = '2.1',
	V3_0 = '3.0',
	V4_0 = '4.0'
}

export interface VCardObjectInterface {
  version: VCardPropertyVersionValues
  properties: VPropertyCollectionInterface
}
