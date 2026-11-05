export interface VParameterObjectInterface {
  name: string
  value: string
  source?: readonly string[] | null
}

/** A parameter defined as a comma-separated list. */
export interface VParameterListInterface extends VParameterObjectInterface {
  list: readonly string[]
}

export type VParameterCollectionInterface = {
  [key: string]: VParameterObjectInterface
} & {
  TYPE?: VParameterListInterface
  PID?: VParameterListInterface
  'SORT-AS'?: VParameterListInterface
}
