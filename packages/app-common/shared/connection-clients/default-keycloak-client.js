/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-Keycloak
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: default-keycloak-client.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 10:14:55 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const atob = require('atob');
const util = require('util');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const { customLogger } = require('../../custom-tools');

const KEYCLOAK_API = {
  // normal
  TAKE_TOKEN: '%s/auth/realms/%s/protocol/openid-connect/token',
  LOGOUT_USER: '%s/auth/admin/realms/%s/users/%s/logout',
  CREATE_USER: '%s/auth/admin/realms/%s/users',
  READ_USER_BY_USERNAME: '%s/auth/admin/realms/%s/users?username=%s',
  UPDATE_USER_CLIENT_ROLE: '%s/auth/admin/realms/%s/users/%s/role-mappings/clients/%s',
  UPDATE_USER_PASSWORD: '%s/auth/admin/realms/%s/users/%s/reset-password',
  DELETE_USER: '%s/auth/admin/realms/%s/users/%s',
  UPDATE_USER: '%s/auth/admin/realms/%s/users/%s',
  READ_CLIENT_ROLES: '%s/auth/admin/realms/%s/clients/%s/roles',
  READ_ONE_CLIENT_ROLE: '%s/auth/admin/realms/%s/clients/%s/roles/%s',
  READ_USERS_OF_CLINET_ROLE: '%s/auth/admin/realms/%s/clients/%s/roles/%s/users',
  // setting
  CREATE_REAML_ROLE: '%s/auth/admin/realms/%s/roles', // {HOST}, {REALM}
  READ_REALM_ROLE_BY_NAME: '%s/auth/admin/realms/%s/roles/%s', // {HOST}, {REALM}, {ROLENAME}
  CREATE_CLIENT_ROLE: '%s/auth/admin/realms/%s/clients/%s/roles', // {HOST}, {REALM}, {KC_CLIENTID}
  UPDATE_CLIENT_ROLE_COMPOSITES: '%s/auth/admin/realms/%s/clients/%s/roles/%s/composites', // {HOST}, {REALM}, {KC_CLIENTID}, {ROLENAME}
  READ_ALL_USERS: '%s/auth/admin/realms/%s/users',
};

class KeyCloakClient {
  static parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));
    return JSON.parse(jsonPayload);
  }

  /**
  * @description user login
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} _account
  * @param {string} _password
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async userLogin(args, _account, _password) {
    const uri = util.format(KEYCLOAK_API.TAKE_TOKEN, args.HOST, args.REALM);
    const _header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const _args = new URLSearchParams();
    _args.append('grant_type', args.USER.GRANT_TYPE);
    _args.append('client_id', args.CLIENT_ID);
    _args.append('client_secret', args.CLIENT_SECRET);
    _args.append('username', _account);
    _args.append('password', _password);

    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: _args });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak User Login fail.');
      throw new Error('Keycloak User Login fail.');
    }
  }

  /**
  * @description remove the user all sessions
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} userId
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async logoutUser(args, userId) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.LOGOUT_USER, args.HOST, args.REALM, userId);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'POST', headers: _header });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak logout user fail.');
      throw new Error('Keycloak logout user fail.');
    }
  }

  /**
  * @description admin login
  * @static
  * @async
  * @method
  * @param {object} args
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async adminLogin(args) {
    const uri = util.format(KEYCLOAK_API.TAKE_TOKEN, args.HOST, args.REALM);
    const _header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const _args = new URLSearchParams();
    _args.append('grant_type', args.ADMIN.GRANT_TYPE);
    _args.append('client_id', args.CLIENT_ID);
    _args.append('client_secret', args.CLIENT_SECRET);

    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: _args });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak Admin Login fail.');
      throw new Error('Keycloak Admin Login fail.');
    }
  }

  /**
  * @description create user
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} _account
  * @param {string} _password
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async createUser(args, _account, _password) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.CREATE_USER, args.HOST, args.REALM);
    const _header = {
      'Content-Type': 'application/json',
      Authorization: `${authorization}`,
    };
    const _body = {
      username: _account,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: _password,
          temporary: false,
        }],
    };
    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: JSON.stringify(_body) });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak create user fail.');
      throw new Error('Keycloak create user fail.');
    }
  }

  /**
  * @description delete user
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} userId
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async deleteUser(args, userId) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.DELETE_USER, args.HOST, args.REALM, userId);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'DELETE', headers: _header });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak delete user fail.');
      throw new Error('Keycloak delete user fail.');
    }
  }

  /**
  * @description read user by name
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} username(account)
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async readUserByUsername(args, userName) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.READ_USER_BY_USERNAME, args.HOST, args.REALM, userName);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'GET', headers: _header });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak create user fail.');
      throw new Error('Keycloak create user fail.');
    }
  }

  /**
  * @description update user (ex: disable)
  * @param {object} args
  * @param {string} userId
  * @param {object} _rep
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async updateUser(args, userId, _rep) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.UPDATE_USER, args.HOST, args.REALM, userId);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };

    try {
      const response = await fetch(uri, { method: 'PUT', headers: _header, body: JSON.stringify(_rep) });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak update user fail.');
      throw new Error('Keycloak update user fail.');
    }
  }

  /**
  * @description update user client roles
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} userId
  * @param {array} clientRoles
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async updateUserClientRole(args, userId, roles) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.UPDATE_USER_CLIENT_ROLE, args.HOST, args.REALM, userId, args.KC_CLIENTID);
    const _header = {
      'Content-Type': 'application/json',
      Authorization: `${authorization}`,
    };
    const _body = roles;
    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: JSON.stringify(_body) });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak update user client-role fail.');
      throw new Error('Keycloak update user client-role fail.');
    }
  }

  /**
  * @description update user password
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} userId
  * @param {string} password
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async updateUserPassword(args, userId, _password) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.UPDATE_USER_PASSWORD, args.HOST, args.REALM, userId);
    const _header = {
      'Content-Type': 'application/json',
      Authorization: `${authorization}`,
    };
    const _body = {
      type: 'password',
      value: _password,
    };
    try {
      const response = await fetch(uri, { method: 'PUT', headers: _header, body: JSON.stringify(_body) });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (ex) {
      customLogger.info('Keycloak update user client-role fail.');
      throw new Error('Keycloak update user client-role fail.');
    }
  }

  /**
  * @description read client roles
  * @static
  * @async
  * @method
  * @param {*} args
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async readClientRoles(args) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.READ_CLIENT_ROLES, args.HOST, args.REALM, args.KC_CLIENTID);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'GET', headers: _header });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak read client roles fail.');
      throw new Error('Keycloak read client roles fail.');
    }
  }

  /**
  * @description read one client role
  * @static
  * @async
  * @method
  * @param {*} args
  * @param {*} roleName
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async readOneClinetRole(args, roleName) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.READ_ONE_CLIENT_ROLE, args.HOST, args.REALM, args.KC_CLIENTID, roleName);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'GET', headers: _header });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak read one client role fail.');
      throw new Error('Keycloak read one client role fail.');
    }
  }

  /**
  * @description read user list
  * @static
  * @async
  * @method
  * @param {object} args
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async readUserList(args) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.READ_ALL_USERS, args.HOST, args.REALM);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'GET', headers: _header });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak read users fail.');
      throw new Error('Keycloak read users fail.');
    }
  }

  /**
  * @description read user by name
  * @static
  * @async
  * @method
  * @param {object} args
  * @param {string} roleName
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async readClientRoleUserList(args, roleName) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.READ_USERS_OF_CLINET_ROLE, args.HOST, args.REALM, args.KC_CLIENTID, roleName);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    try {
      const response = await fetch(uri, { method: 'GET', headers: _header });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak read clinet-role users fail.');
      throw new Error('Keycloak read clinet-role users fail.');
    }
  }

  /**
  * @description create clinet role
  * @param {object} args
  * @param {string} roleName
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async createClientRole(args, roleName) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.CREATE_CLIENT_ROLE, args.HOST, args.REALM, args.KC_CLIENTID);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    const _body = {
      name: roleName,
      composite: true,
    };
    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: _body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak create one client role fail.');
      throw new Error('Keycloak create one client role fail.');
    }
  }

  /**
  * @description add a composite to clinet role
  * @param {*} args
  * @param {*} roleName
  * @param {*} realmClientIds
  */
  static async updateClientRoleComposites(args, roleName, realmClientIds) {
    const authorization = `bearer ${args.access_token}`;
    const uri = util.format(KEYCLOAK_API.CREATE_CLIENT_ROLE, args.HOST, args.REALM, args.KC_CLIENTID, roleName);
    const _header = {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `${authorization}`,
    };
    const _body = [];
    for (const _id of realmClientIds) {
      _body.push({ id: _id });
    }
    try {
      const response = await fetch(uri, { method: 'POST', headers: _header, body: _body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      customLogger.info('Keycloak create one client role fail.');
      throw new Error('Keycloak create one client role fail.');
    }
  }
}

module.exports = KeyCloakClient;
