import { VPropertyAddressType } from "./VPropertyAddressType"
import { VPropertyBase } from "./VPropertyBase"
import { VPropertyClientPidMapType } from "./VPropertyClientPidMapType"
import { VPropertyGenderType } from "./VPropertyGenderType"
import { VPropertyGeoType } from "./VPropertyGeoType"
import { VPropertyMediaType } from "./VPropertyMediaType"
import { VPropertyNameType } from "./VPropertyNameType"
import { VPropertyOrganizationType } from "./VPropertyOrganizationType"
import { VPropertyStringCollectionType } from "./VPropertyStringCollectionType"
import { VPropertyTemporalType } from "./VPropertyTemporalType"
import { VPropertyTextType } from "./VPropertyTextType"
import { VPropertyTextOrUriType } from "./VPropertyTextOrUriType"
import { VPropertyTimeZoneType } from "./VPropertyTimeZoneType"
import { VPropertyUriOrTextType } from "./VPropertyUriOrTextType"
import { VPropertyUriType } from "./VPropertyUriType"
import type { VCardVersion } from "../VCardInterfaces"

// VCard properties with runtime introspection capability
export const propertyTypes: Record<
    string,
    (new (...args: any[]) => VPropertyBase) | undefined
> = {
    // RFC 6350
    SOURCE: VPropertyUriType,
    KIND: VPropertyTextType,
    XML: VPropertyTextType,
    FN: VPropertyTextType,
    N: VPropertyNameType,
    NICKNAME: VPropertyStringCollectionType,
    PHOTO: VPropertyMediaType,
    BDAY: VPropertyTemporalType,
    ANNIVERSARY: VPropertyTemporalType,
    GENDER: VPropertyGenderType,
    ADR: VPropertyAddressType,
    TEL: VPropertyTextOrUriType,
    EMAIL: VPropertyTextType,
    IMPP: VPropertyUriType,
    LANG: VPropertyTextType,
    TZ: VPropertyTimeZoneType,
    GEO: VPropertyGeoType,
    TITLE: VPropertyTextType,
    ROLE: VPropertyTextType,
    LOGO: VPropertyMediaType,
    ORG: VPropertyOrganizationType,
    MEMBER: VPropertyUriType,
    RELATED: VPropertyUriOrTextType,
    CATEGORIES: VPropertyStringCollectionType,
    NOTE: VPropertyTextType,
    PRODID: VPropertyTextType,
    REV: VPropertyTemporalType,
    SOUND: VPropertyMediaType,
    UID: VPropertyUriOrTextType,
    CLIENTPIDMAP: VPropertyClientPidMapType,
    URL: VPropertyUriType,
    VERSION: VPropertyTextType,
    KEY: VPropertyUriOrTextType,
    FBURL: VPropertyUriType,
    CALADRURI: VPropertyUriType,
    CALURI: VPropertyUriType,

    // RFC 6474
    BIRTHPLACE: VPropertyTextOrUriType,
    DEATHPLACE: VPropertyTextOrUriType,
    DEATHDATE: VPropertyTemporalType,

    // RFC 6715
    EXPERTISE: VPropertyTextType,
    HOBBY: VPropertyTextType,
    INTEREST: VPropertyTextType,
    'ORG-DIRECTORY': VPropertyUriType,

    // RFC 8605
    'CONTACT-URI': VPropertyUriType,

    // RFC 9554
    CREATED: VPropertyTemporalType,
    GRAMGENDER: VPropertyTextType,
    LANGUAGE: VPropertyTextType,
    PRONOUNS: VPropertyTextType,
    SOCIALPROFILE: VPropertyUriOrTextType,

    // RFC 9555
    JSPROP: VPropertyTextType,

    // RFC 2426 properties removed from vCard 4.0
    NAME: VPropertyTextType,
    PROFILE: VPropertyTextType,
    LABEL: VPropertyTextType,
    MAILER: VPropertyTextType,
    AGENT: VPropertyTextType,
    'SORT-STRING': VPropertyTextType,
    CLASS: VPropertyTextType,
}

export const propertyCardinalities: Record<
    string,
    Partial<Record<VCardVersion, { min?: number; max?: number }>>
> = {
    FN: {
        '3.0': { min: 1 },
        '4.0': { min: 1 },
    },
    N: {
        '3.0': { min: 1, max: 1 },
        '4.0': { max: 1 },
    },
    KIND: { '4.0': { max: 1 } },
    BDAY: { '4.0': { max: 1 } },
    ANNIVERSARY: { '4.0': { max: 1 } },
    GENDER: { '4.0': { max: 1 } },
    PRODID: { '4.0': { max: 1 } },
    REV: { '4.0': { max: 1 } },
    UID: { '4.0': { max: 1 } },
    BIRTHPLACE: { '4.0': { max: 1 } },
    DEATHPLACE: { '4.0': { max: 1 } },
    DEATHDATE: { '4.0': { max: 1 } },
    CREATED: { '4.0': { max: 1 } },
    LANGUAGE: { '4.0': { max: 1 } },
}
