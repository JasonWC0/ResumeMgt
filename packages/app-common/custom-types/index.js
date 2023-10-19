/**
 * FeaturePath: Common-Config--參數說明
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/**
 * @ignore
 * @typedef errorCodeObject
 * @property {string} alias
 * @property {number} code
 * @property {number} httpStatus
 * @property {string} message
 */

/**
 * @typedef configObject
 * @property {object} SERVICE - Service
 * @property {string} SERVICE.NAME - Service name
 * @property {string} SERVICE.PREFIX - Service uri prefix
 * @property {string} SERVICE.HOST Service Host
 * @property {string[]} SERVICE.CORS cors site
 * @property {object} KEYCLOAK - Keycloak
 * @property {string} KEYCLOAK.HOST - Keycloak host
 * @property {string} KEYCLOAK.REALM - Keycloak realm name
 * @property {string} KEYCLOAK.CLIENT_ID - Keycloak client id
 * @property {string} KEYCLOAK.CLIENT_SECRET - Keycloak clinet secret key
 * @property {string} KEYCLOAK.KC_CLIENTID - clinet id on Keycloak
 * @property {string} KEYCLOAK.USER.GRANT_TYPE - user take token gant type
 * @property {string} KEYCLOAK.ADMIN.GRANT_TYPE - admin take token gent type
 * @property {object} DATABASES - Databases
 * @property {object} DATABASES.DEFAULT_MONGO - Default mongo db
 * @property {string} DATABASES.DEFAULT_MONGO.URI - Mongo db uri
 * @property {string} DATABASES.DEFAULT_MONGO.USER - User for login mongodb
 * @property {string} DATABASES.DEFAULT_MONGO.PASS - Password for login mongodb
 * @property {number} DATABASES.DEFAULT_MONGO.POOL_SIZE - Pool size
 * @property {string} DATABASES.DEFAULT_MONGO.DB_NAME - Database name
 * @property {object} SESSION - Session
 * @property {string} SESSION.KEY - session key
 * @property {number} SESSION.MAX_AGE - expired time(ms) 1day=24*60*60*1000
 * @property {boolean} SESSION.AUTO_COMMIT - automatically commit headers
 * @property {boolean} SESSION.OVERWRITE - can overwrite or not
 * @property {boolean} SESSION.HTTP_ONLY - httpOnly or not
 * @property {boolean} SESSION.SIGNED - signed or not
 * @property {boolean} SESSION.ROLLING - rolling update session expired time
 * @property {string} SESSION.SAME_SITE - default null, don't set it
 * @property {string} SESSION.STORE_COLLECTION - store collection name
 * @property {object} FILE
 * @property {number} FILE.SIZE
 * @property {string} FILE.PATH
 * @property {string} FILE.TEMP
 * @property {object} ADMIN_AUTH
 * @property {string} ADMIN_AUTH.KEY - admin api authorization's key
 * @property {string} ADMIN_AUTH.value - admin api authorization's value
 * @property {object} REGISTER - external site register
 * @property {string} REGISTER.KEY external site authorization's key
 * @property {object[]} REGISTER.CLIENTS register clients
 * @property {string} REGISTER.CLIENTS[].DOMAIN client name
 * @property {string} REGISTER.CLIENTS[].CLIENT_SECRET - client secret value
 */
