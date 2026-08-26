import { VPropertyAddressType } from "./VPropertyAddressType"
import { VPropertyBase } from "./VPropertyBase"
import { VPropertyGenderType } from "./VPropertyGenderType"
import { VPropertyNameType } from "./VPropertyNameType"
import { VPropertyOrganizationType } from "./VPropertyOrganizationType"
import { VPropertyStringCollectionType } from "./VPropertyStringCollectionType"
import { VPropertyTemporalType } from "./VPropertyTemporalType"
import { VPropertyTextType } from "./VPropertyTextType"
import { VPropertyUriType } from "./VPropertyUriType"

// VCard properties with runtime introspection capability
export const knownProperties: Record<string, new (...args: any[]) => VPropertyBase<any>> = {
    // RFC 6350
    SOURCE: VPropertyUriType,
    KIND: VPropertyTextType,
    XML: VPropertyTextType,
    FN: VPropertyTextType,
    N: VPropertyNameType,
    NICKNAME: VPropertyStringCollectionType,
    PHOTO: VPropertyUriType,
    BDAY: VPropertyTemporalType,
    ANNIVERSARY: VPropertyTemporalType,
    GENDER: VPropertyGenderType,
    ADR: VPropertyAddressType,
    TEL: VPropertyUriType,
    EMAIL: VPropertyTextType,
    IMPP: VPropertyUriType,
    LANG: VPropertyTextType,
    TZ: VPropertyTextType,
    GEO: VPropertyUriType,
    TITLE: VPropertyTextType,
    ROLE: VPropertyTextType,
    LOGO: VPropertyUriType,
    ORG: VPropertyOrganizationType,
    MEMBER: VPropertyUriType,
    RELATED: VPropertyTextType,
    CATEGORIES: VPropertyStringCollectionType,
    NOTE: VPropertyTextType,
    PRODID: VPropertyTextType,
    REV: VPropertyTemporalType,
    SOUND: VPropertyUriType,
    UID: VPropertyTextType,
    CLIENTPIDMAP: VPropertyBase,
    URL: VPropertyUriType,
    VERSION: VPropertyTextType,
    KEY: VPropertyTextType,
    FBURL: VPropertyUriType,
    CALADRURI: VPropertyUriType,
    CALURI: VPropertyUriType,

    // RFC 6474
    BIRTHPLACE: VPropertyTextType,
    DEATHPLACE: VPropertyTextType,
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
    SOCIALPROFILE: VPropertyBase,

    // RFC 9555
    JSPROP: VPropertyTextType,

    // RFC 2426 properties removed from vCard 4.0
    NAME: VPropertyTextType,
    PROFILE: VPropertyTextType,
    LABEL: VPropertyTextType,
    MAILER: VPropertyTextType,
    AGENT: VPropertyBase,
    'SORT-STRING': VPropertyTextType,
    CLASS: VPropertyTextType,
}
