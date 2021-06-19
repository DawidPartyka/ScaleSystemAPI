const { Op, Sequelize } = require('sequelize');
const UserLog = require('../../models/userActionLog');
const date = require('./dateFormat');
const result = require('./resultObj');

const helper = {
    createLog: async (title, data, status, additionalData) => {
        return await UserLog.create({
            action: title,
            ip: data.ip,
            UserId: data.dbid,
            responseStatus: status ?? 200,
            additionalData: additionalData ?? null
        }).catch(err => console.log(err));
    },

    getAllUserLog: async function (userData){
        let result = {
            title: 'Get all specific user log data',
            user: userData.dbid,
            data: null,
            status: 200
        }

        const logs = await UserLog.findAll({
            where: {
                UserId: userData.dbid
            }
        });

        if(!logs){
            result.data = 'No data found';
            result.status = 404;

            await this.createLog(result.title, userData, result.status);
        }
        else
            result.data = logs;

        await this.createLog(
            result.title,
            userData,
            result.status,
            JSON.stringify({
                returned: result.data.length
            })
        );

        return result;
    },

    getUserLogInDate: async function (userData, start, end){
        const result = {
            title: 'Get specific user log data',
            user: userData.dbid,
            requestedDateStart: start,
            requestedDateEnd: end,
            data: null,
            status: 200
        }

        const range = date.dateRange(start, end);

        if(!range){
            result.status = 400;
            result.data = 'Incorrect date data';

            await this.createLog(result.title,
                userData,
                result.status,
                JSON.stringify({
                    msg: result.data
                })
            );

            return result;
        }

        const logs = await UserLog.findAll({
            attributes: ['id', 'action', 'ip', 'createdAt', 'updatedAt'],
            where: {
                UserId: userData.dbid,
                createdAt: {
                    [Op.gte]: range.start,
                    [Op.lte]: range.end
                }
            }
        });

        if(!logs.length){
            result.status = 404;
            result.data = 'No data found';
        }
        else
            result.data = logs;

        await this.createLog(result.title,
            userData,
            result.status,
            JSON.stringify({
                returnedRecords: result.data.length
            })
        );

        return result;
    },

    getActionsCountGrouped: async (start, end, limit) => {
        const range = date.dateRange(start, end);

        const logs = await UserLog.findAll({
            attributes: ['action', [Sequelize.fn('count', Sequelize.col('id')), 'action_count']],
            where: {
                createdAt: {
                    [Op.gte]: range.start,
                    [Op.lte]: range.end
                }
            },
            group: 'action',
            order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
            limit: limit,
            raw: true
        });

        return logs.map((x) => {
            return{
                action: x.action,
                count: x.action_count
            }
        });
    },

    getUserAmountInDate: async (start, end) => {
        const range = date.dateRange(start, end);

        const logCount = await UserLog.count({
            where: {
                createdAt: {
                    [Op.gte]: range.start,
                    [Op.lte]: range.end
                }
            },
            distinct: true,
            col: 'UserId'
        });

        if(!logCount){
            console.log('Nothing here');
            return;
        }

        return logCount;
    },

    // status - status code or array of status codes or a boolean (true - <100, 400), false <400, inf))
    // userId - ...user id, optional
    // start  - start date
    // end    - end date
    // count  - if count is true then it will just count the logs instead of getting all records
    getAllLogsByResponseStatus: async (status, userId, start, end, count) => {
        const range = date.dateRange(start, end);

        const searchOptions = {
            where: {
                responseStatus: null,
                createdAt: {
                    [Op.gte]: range.start,
                    [Op.lte]: range.end
                }
            }
        }

        if(userId)
            searchOptions.where.UserId = userId;

        if(typeof status === 'boolean'){
            if(status)
                searchOptions.where.responseStatus = { // Status codes in <100, 400) range
                    [Op.gte]: 100,
                    [Op.lt]: 400
                }
            else
                searchOptions.where.responseStatus = { // Status codes in <400, inf) range
                    [Op.gte]: 400
                }
        }
        else
            searchOptions.where.responseStatus = status; // Can be a specific status code...
                                                         // This way it can return all logs with successful,
                                                         // failed or specific status codes

        const logs = count ? await UserLog.count(searchOptions).catch(e => console.log(e)) :
            await UserLog.findAll(searchOptions).catch(e => console.log(e));


        return logs;
    }
}

module.exports = helper;