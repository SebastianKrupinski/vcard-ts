import { VPropertyCollectionInterface } from "./properties/VPropertyInterfaces"

export enum VCardVersion {
	V3_0 = '3.0',
	V4_0 = '4.0'
}

export interface VCardInterface {
  version: VCardVersion
  properties: VPropertyCollectionInterface
}
