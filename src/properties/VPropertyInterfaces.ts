import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces"
import type { VPropertyValueBase } from './VPropertyValueBase'

export interface VPropertyBaseInterface<T = string | string[] | VPropertyValueBase> {
  id: string
  name: string
  group: string | null
  params: VParameterCollectionInterface
  readonly value: T | null
  hasGroup: boolean
  hasParams: boolean
  hasValue: boolean
}

export interface VPropertyCollectionInterface extends Array<VPropertyBaseInterface> {}
