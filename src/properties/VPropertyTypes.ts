import { VPropertyAddressType } from "./VPropertyAddressType"
import { VPropertyGenderType } from "./VPropertyGenderType"
import { VPropertyNameType } from "./VPropertyNameType"
import { VPropertyOrganizationType } from "./VPropertyOrganizationType"
import { VPropertyStringCollectionType } from "./VPropertyStringCollectionType"
import { VPropertyTemporalType } from "./VPropertyTemporalType"
import { VPropertyTextType } from "./VPropertyTextType"
import { VPropertyUriType } from "./VPropertyUriType"

// VCard properties with runtime introspection capability
export const knownProperties = {
    // Cardinality: 1
    VERSION: VPropertyTextType,
    // Cardinality: *1
    PRODID: VPropertyTextType,
    UID: VPropertyTextType,
    REV: VPropertyTemporalType,
    KIND: VPropertyTextType,
    N: VPropertyNameType,
    BDAY: VPropertyTemporalType,
    BIRTHPLACE: VPropertyTextType, // RFC6474
    DEATHPLACE: VPropertyTextType, // RFC6474
    DEATHDATE: VPropertyTemporalType, // RFC6474
    ANNIVERSARY: VPropertyTemporalType,
    GENDER: VPropertyGenderType,
    // Cardinality: 1*
    FN: VPropertyTextType,
    // Cardinality: *
    NICKNAME: VPropertyStringCollectionType,
    ADR: VPropertyAddressType,
    TEL: VPropertyUriType,
    EMAIL: VPropertyTextType,
    IMPP: VPropertyUriType,
    PHOTO: VPropertyUriType,
    
    SOURCE: VPropertyTextType,
    XML: VPropertyTextType,
    LANG: VPropertyTextType,
    TZ: VPropertyTextType,
    GEO: VPropertyUriType,
    TITLE: VPropertyTextType,
    ROLE: VPropertyTextType,
    LOGO: VPropertyTextType,
    ORG: VPropertyOrganizationType,
    MEMBER: VPropertyTextType,
    RELATED: VPropertyTextType,
    CATEGORIES: VPropertyStringCollectionType,
    NOTE: VPropertyTextType,
    SOUND: VPropertyTextType,
    URL: VPropertyUriType,
    KEY: VPropertyTextType,
    FBURL: VPropertyTextType,
    CALADRURI: VPropertyTextType,
    CALURI: VPropertyTextType,
    CONTACT_URI: VPropertyTextType, // RFC8605
    EXPERTISE: VPropertyTextType, // RFC6715
    HOBBY: VPropertyTextType, // RFC6715
    INTEREST: VPropertyTextType, // RFC6715
    ORG_DIRECTORY: VPropertyTextType, // RFC6715
}