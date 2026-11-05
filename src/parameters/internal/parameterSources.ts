import type { VParameterObject } from '../VParameterObject'

/** Original source shared by the parameter codec and value setters. */
export const parameterSources = new WeakMap<VParameterObject, readonly string[]>()
