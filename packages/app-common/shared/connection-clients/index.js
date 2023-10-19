/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-連線列表
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

module.exports = {
  DefaultDBClient: require('./default-db-client'),
  KeyCloakClient: require('./default-keycloak-client'),
  DefaultStorageServiceClient: require('./default-storage-service-client'),
  MedicineServiceClient: require('./default-medicine-service-client'),
  LunaServiceClient: require('./default-luna-service-client'),
  ECPayServiceClient: require('./default-ecpay-service-client'),
  SideAServiceClient: require('./default-sidea-service-client'),
  NativeDBClient: require('./native-db-client'),
};
