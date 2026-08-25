import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces"

export interface VPropertyBaseInterface<T = string> {
  id: string
  name: string
  group: string | null
  params: VParameterCollectionInterface
  value: T | null
  hasGroup: boolean
  hasParams: boolean
  hasValue: boolean
}

export interface VPropertyCollectionInterface extends Array<VPropertyBaseInterface> {}