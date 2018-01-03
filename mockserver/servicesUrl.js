/**
 * @file api config
 * @author zhang.com
 */
module.exports = {
    USER: {
        getUser: {
            method: 'get',
            url: '/data/user'
        }
    },
    INDEX: {
        getSummaryData: {
            method: 'get',
            url: '/data/report/dashboard/summary'
        }
    },
    PF: {
        postServiceBuildData: {
            method: 'post',
            url: '/data/testType'
        }
    }
};
