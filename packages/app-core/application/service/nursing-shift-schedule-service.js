/**
 * FeaturePath: 住宿式服務-排班-排班管理-排班CRUD
 * FeaturePath: 住宿式服務-排班-排班管理-複製排班
 * FeaturePath: 住宿式服務-排班-排班管理-批次排班
 * FeaturePath: 住宿式服務-排班-排班管理-班別UD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-24 04:03:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { coreErrorCodes } = require('../../domain');
const { CompanyRepository, NursingShiftScheduleRepository, NursingShiftRepository } = require('../../infra/repositories');

const DEFAULT_FORBIDDEN_LESS_HOUR = 8;
const DEFAULT_WARNING_OVER_HOUR = 8;
const DEFAULT_WARNING_LESS_HOUR = 11;
const CHECK_TYPE = {
  ALL: 0,
  BEFORE: 1,
  AFTER: 2,
};
class NursingShiftScheduleService {
  static async takeFutureNursingShiftSchedule(nursingShiftId, noLeave = true) {
    const updateQuery = {
      date: { $gte: moment().startOf('day').add(1, 'days').toDate() },
      nursingShiftId,
    };
    if (noLeave) {
      updateQuery.$or = [
        { employeeLeaveHistoryIds: { $in: [null, []] } },
        { employeeLeaveHistoryIds: { $exists: false } }
      ];
    }
    const updateSchedules = await NursingShiftScheduleRepository.findByQbe(updateQuery);
    return updateSchedules || [];
  }

  static async takeRCShiftScheduleRule(companyId) {
    const companyEntity = await CompanyRepository.findById(companyId);
    const forbiddenLessHours = companyEntity?.institutionSetting?.RCShiftScheduleRules?.forbiddenLessHours || DEFAULT_FORBIDDEN_LESS_HOUR;
    const warningOverHours = companyEntity?.institutionSetting?.RCShiftScheduleRules?.warningOverHours || DEFAULT_WARNING_OVER_HOUR;
    const warningLessHours = companyEntity?.institutionSetting?.RCShiftScheduleRules?.warningLessHours || DEFAULT_WARNING_LESS_HOUR;
    return { forbiddenLessHours, warningOverHours, warningLessHours };
  }

  static sort(entities) {
    entities.sort((a, b) => {
      if (a.startedAt > b.startedAt) { return 1; }
      if (a.startedAt < b.startedAt) { return -1; }
      return -1;
    });
  }

  static insideCheck(entities, forbiddenHour, warningLessHours, warningOverHour) {
    NursingShiftScheduleService.sort(entities);
    const forbiddenLog = [];
    const warningLog = [];
    entities.forEach((entity, index, array) => {
      if (!entity.nursingShift.isDayOff) {
        if (index !== 0 && !array[index - 1].nursingShift.isDayOff) {
          const diffBefore = moment(entity.startedAt).diff(moment(array[index - 1].endedAt), 'hours');
          if (diffBefore < forbiddenHour) {
            forbiddenLog.push(entity);
          } else if (diffBefore < warningOverHour && warningLessHours < diffBefore) {
            warningLog.push(entity);
          }
        }
        if ((index !== entities.length - 1) && !array[index + 1].nursingShift.isDayOff) {
          const diffAfter = moment(array[index + 1].startedAt).diff(moment(entity.endedAt), 'hours');
          if (diffAfter < forbiddenHour) {
            forbiddenLog.push(entity);
          } else if (diffAfter < warningOverHour && warningLessHours < diffAfter) {
            warningLog.push(entity);
          }
        }
      }
    });
    return { forbiddenLog, warningLog };
  }

  static async checkForbidden(entity, hour, checkType = CHECK_TYPE.ALL, checkDate = true) {
    const check = {
      companyId: entity.companyId,
      personId: entity.personId,
      isDayOff: false, // 'nursingShift.isDayOff': false,
    };
    switch (checkType) {
      case CHECK_TYPE.BEFORE:
        if (checkDate) {
          check.date = moment(CustomUtils.deepCopy(entity.date)).subtract(1, 'days').toDate();
        }
        check.endedAt = {
          $gt: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(hour, 'hour').toDate(),
          $lte: moment(CustomUtils.deepCopy(entity.endedAt)).toDate(),
        };
        break;
      case CHECK_TYPE.AFTER:
        if (checkDate) {
          check.date = moment(CustomUtils.deepCopy(entity.date)).add(1, 'days').toDate();
        }
        check.startedAt = {
          $gte: moment(CustomUtils.deepCopy(entity.startedAt)).toDate(),
          $lt: moment(CustomUtils.deepCopy(entity.endedAt)).add(hour, 'hour').toDate(),
        };
        break;
      case CHECK_TYPE.ALL:
      default:
        if (checkDate) {
          check.date = [moment(CustomUtils.deepCopy(entity.date)).subtract(1, 'days').toDate(), moment(CustomUtils.deepCopy(entity.date)).add(1, 'days').toDate()];
        }
        check.$or = [
          {
            endedAt: {
              $gt: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(hour, 'hour').toDate(),
              $lte: moment(CustomUtils.deepCopy(entity.endedAt)).toDate(),
            },
          },
          {
            startedAt: {
              $gte: moment(CustomUtils.deepCopy(entity.startedAt)).toDate(),
              $lt: moment(CustomUtils.deepCopy(entity.endedAt)).add(hour, 'hour').toDate(),
            },
          }
        ];
        break;
    }

    const res = await NursingShiftScheduleRepository.findByQbe(check);
    const exist = (res && res.length > 0) ? res.filter((e) => e.id !== entity.id) : false;
    return (exist && exist.length > 0);
  }

  static async checkWarning(entity, warningLessHours, warningOverHour, checkType = CHECK_TYPE.ALL) {
    const query = {
      companyId: entity.companyId,
      personId: entity.personId,
      isDayOff: false, // 'nursingShift.isDayOff': false,
    };
    switch (checkType) {
      case CHECK_TYPE.BEFORE:
        query.endedAt = {
          $gt: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(warningLessHours, 'hour').toDate(),
          $lte: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(warningOverHour, 'hour').toDate(),
        };
        break;
      case CHECK_TYPE.AFTER:
        query.startedAt = {
          $gte: moment(CustomUtils.deepCopy(entity.endedAt)).add(warningLessHours, 'hour').toDate(),
          $lt: moment(CustomUtils.deepCopy(entity.endedAt)).add(warningOverHour, 'hour').toDate(),
        };
        break;
      case CHECK_TYPE.ALL:
      default:
        query.$or = [
          {
            endedAt: {
              $gt: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(warningLessHours, 'hour').toDate(),
              $lte: moment(CustomUtils.deepCopy(entity.startedAt)).subtract(warningOverHour, 'hour').toDate(),
            },
          },
          {
            startedAt: {
              $gte: moment(CustomUtils.deepCopy(entity.endedAt)).add(warningLessHours, 'hour').toDate(),
              $lt: moment(CustomUtils.deepCopy(entity.endedAt)).add(warningOverHour, 'hour').toDate(),
            },
          }
        ];
        break;
    }

    const res = await NursingShiftScheduleRepository.findByQbe(query);
    const exist = res.filter((e) => e.id !== entity.id);
    return (exist && exist.length > 0);
  }

  static async boundaryCheck(startEntity, endEntity, forbiddenHour, warningLessHours, warningOverHour) {
    const boundaryForbiddenLog = [];
    const boundaryWarningLog = [];
    if (!startEntity.nursingShift.isDayOff) {
      const forbidden = await NursingShiftScheduleService.checkForbidden(startEntity, forbiddenHour, CHECK_TYPE.BEFORE);
      if (forbidden) {
        boundaryForbiddenLog.push(startEntity);
      } else {
        const warning = await NursingShiftScheduleService.checkWarning(startEntity, warningLessHours, warningOverHour, CHECK_TYPE.BEFORE);
        if (warning) { boundaryWarningLog.push(startEntity); }
      }
    }
    if (!endEntity.nursingShift.isDayOff) {
      const forbidden = await NursingShiftScheduleService.checkForbidden(endEntity, forbiddenHour, CHECK_TYPE.AFTER);
      if (forbidden) {
        boundaryForbiddenLog.push(endEntity);
      } else {
        const warning = await NursingShiftScheduleService.checkWarning(endEntity, warningLessHours, warningOverHour, CHECK_TYPE.AFTER);
        if (warning) { boundaryWarningLog.push(endEntity); }
      }
    }
    return { boundaryForbiddenLog, boundaryWarningLog };
  }

  static async oneCheck(entity) {
    let needWarning = false;
    if (!entity.nursingShift.isDayOff) {
      const { forbiddenLessHours, warningLessHours, warningOverHour } = await NursingShiftScheduleService.takeRCShiftScheduleRule(entity.companyId);
      const check = await NursingShiftScheduleService.checkForbidden(entity, forbiddenLessHours, CHECK_TYPE.ALL, false);
      if (check) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_SCHEDULE_TOO_CLOSED); }
      needWarning = await NursingShiftScheduleService.checkWarning(entity, warningLessHours, warningOverHour);
    }
    return needWarning;
  }

  static async multiCheck(entities, oriEntities) {
    NursingShiftScheduleService.sort(entities);

    const personIds = [];
    entities.forEach((e) => { if (!personIds.includes(e.personId)) { personIds.push(e.personId); } });

    const warnings = [];
    const usedEntities = [];
    for await (const pId of personIds) {
      const pEntities = entities.filter((e) => CustomValidator.isEqual(e.personId, pId));

      const oriHasLeave = oriEntities.filter((e) => CustomValidator.nonEmptyArray(e.employeeLeaveHistoryIds));
      const tempList = [...oriHasLeave];
      pEntities.forEach((entity) => {
        const ori = oriEntities.filter((e) => moment(e.date).isSame(moment(entity.date)) && CustomValidator.nonEmptyArray(e.employeeLeaveHistoryIds));
        if (ori.length === 0) {
          tempList.push(entity);
          usedEntities.push(entity);
        }
      });

      const { forbiddenLessHours, warningLessHours, warningOverHours } = await NursingShiftScheduleService.takeRCShiftScheduleRule(tempList[0].companyId);
      // check the first one and the last one
      const startEntity = tempList[0];
      const endEntity = tempList[tempList.length - 1];
      const { boundaryForbiddenLog, boundaryWarningLog } = await NursingShiftScheduleService.boundaryCheck(startEntity, endEntity, forbiddenLessHours, warningLessHours, warningOverHours);
      if (boundaryForbiddenLog.length > 0) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_SCHEDULE_TOO_CLOSED); }
      // check inside
      const { forbiddenLog, warningLog } = NursingShiftScheduleService.insideCheck(tempList, forbiddenLessHours, warningLessHours, warningOverHours);
      if (forbiddenLog.length > 0) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_SCHEDULE_TOO_CLOSED); }

      const tempWarning = boundaryWarningLog.concat(warningLog);
      tempWarning.forEach((warn) => {
        const _data = { date: warn.date, personId: warn.personId };
        if (!warnings.includes(_data)) { warnings.push(_data); }
      });
    }

    return { usedEntities, warnings };
  }

  static async createOne(entity) {
    const needWarning = await NursingShiftScheduleService.oneCheck(entity);
    // create
    await NursingShiftScheduleRepository.create(entity);
    return needWarning;
  }

  static async updateOne(entity) {
    const needWarning = await NursingShiftScheduleService.oneCheck(entity);
    // update
    await NursingShiftScheduleRepository.updateById(entity.id, entity);
    return needWarning;
  }

  static async createMulti(entities, oriEntities) {
    let session = null;
    try {
      const { usedEntities, warnings } = await NursingShiftScheduleService.multiCheck(entities, oriEntities);

      session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        // delete ori Entities
        const deleteIds = [];
        const noLeaveHistEntities = oriEntities.filter((e) => !CustomValidator.nonEmptyArray(e.employeeLeaveHistoryIds));
        noLeaveHistEntities.forEach((e) => { if (!deleteIds.includes(e.id)) { deleteIds.push(e.id); } });
        if (deleteIds.length > 0) {
          await NursingShiftScheduleRepository.deleteByIds(deleteIds, { __cc: entities[0].__cc, __sc: entities[0].__sc }, entities[0].modifier, session);
        }

        // create
        await NursingShiftScheduleRepository.createMulti(usedEntities, session);
        return warnings;
      });
      session.endSession();
    } catch (ex) {
      if (session) { session.endSession(); }
      if (ex.constructor === new models.CustomError().constructor) { throw ex; }
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateByNursingShift(nursingShiftEntity, baseInfo = {}, personId) {
    const nursingShiftId = nursingShiftEntity.id;
    let allWarnings = [];
    let session = null;
    try {
      session = await DefaultDBClient.takeConnection().startSession();
      // 1. Query需更新的NursingShiftSchedule: 未來排班+未有請假紀錄
      const updateSchedules = await NursingShiftScheduleService.takeFutureNursingShiftSchedule(nursingShiftId);
      await session.withTransaction(async () => {
        if (updateSchedules && updateSchedules.length > 0) {
          // 2. Bind 新班別內容
          updateSchedules.forEach((nursingShiftSchedule) => {
            nursingShiftSchedule.withNursingShift(nursingShiftEntity).calcTime().toDate();
          });
          NursingShiftScheduleService.sort(updateSchedules);
          // 3. 判斷是否為休息班：true(直接全部更新); false(進一步檢查排班時數間隔)
          if (nursingShiftEntity.isDayOff) {
            // 4.a update all
            await NursingShiftScheduleRepository.updateMulti(updateSchedules, baseInfo, personId, session);
          } else {
            // 4.b 檢查後更新
            // 4.b.1 Query所含區間內的所有排班
            const personIds = [...new Set(updateSchedules.map((f) => f.personId))];
            const toQuery = {
              companyId: nursingShiftEntity.companyId,
              fromStartDate: moment(updateSchedules[0].date).format('YYYY/MM/DD'),
              fromEndDate: moment(updateSchedules[updateSchedules.length - 1].date).format('YYYY/MM/DD'),
            };
            if (CustomValidator.nonEmptyArray(personIds)) { toQuery.personIds = personIds; }
            const oriEntities = await NursingShiftScheduleRepository.findByQbe(toQuery);

            // 4.b.2 每一人檢查排班時數間隔
            let allAdd = [];
            await Promise.all(personIds.map(async (_personId) => {
              const personUpdateEntities = updateSchedules.filter((e) => CustomValidator.isEqual(e.personId, _personId));
              const dates = personUpdateEntities.map((e) => moment(e.date));
              const personOriEntities = oriEntities.filter((e) => CustomValidator.isEqual(e.personId, _personId) && moment(e.date).isSameOrAfter(moment.min(dates)) && moment(e.date).isSameOrBefore(moment.max(dates)));
              const { usedEntities, warnings } = await NursingShiftScheduleService.multiCheck(personUpdateEntities, personOriEntities);
              allAdd = [].concat(allAdd, usedEntities);
              allWarnings = [].concat(allWarnings, warnings);
            }));
            // 4.b.3 更新排班
            await NursingShiftScheduleRepository.updateMulti(allAdd, baseInfo, personId, session);
          }
        }
        // 5.更新班別
        await NursingShiftRepository.updateById(nursingShiftId, nursingShiftEntity, session);
      });
      session.endSession();
      return allWarnings;
    } catch (ex) {
      if (session) { session.endSession(); }
      if (ex.constructor === new models.CustomError().constructor) { throw ex; }
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteByNursingShift(nursingShiftId, baseInfo = {}, personId) {
    let session = null;
    try {
      const futureSchedules = await NursingShiftScheduleService.takeFutureNursingShiftSchedule(nursingShiftId);
      const ids = (futureSchedules && futureSchedules.length > 0) ? futureSchedules.map((e) => e.id) : [];
      session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        if (ids.length > 0) { await NursingShiftScheduleRepository.deleteByIds(ids, baseInfo, personId, session); }
        await NursingShiftRepository.deleteById(nursingShiftId, baseInfo, personId, session);
      });
      session.endSession();
    } catch (ex) {
      if (session) { session.endSession(); }
      LOGGER.error(ex.stack);
      throw new models.CustomError(ex);
    }
  }
}

module.exports = NursingShiftScheduleService;
