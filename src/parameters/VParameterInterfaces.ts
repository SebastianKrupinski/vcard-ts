export interface VParameterObjectInterface {
  name: string
  value: string
}

export interface VParameterCollectionInterface {
  [key: string]: VParameterObjectInterface
}