const { Sequelize, DataTypes } = require("sequelize");
const config = require('../../config');

const methods = ['get', 'set', 'add', 'delete'];
const types = [
    { 'antibot': 'object' },
    { 'antifake': 'object' },
    { 'antilink': 'object' },
    { 'antiword': 'object' },
    { 'antidemote': 'string' },
    { 'antipromote': 'string' },
    { 'filter': 'object' },
    { 'warn': 'object' },
    { 'welcome': 'object' },
    { 'exit': 'object' },
    { 'pdm': 'string' },
    { 'mute': 'string' },
    { 'unmute': 'string' }
];

function jsonConcat(o1, o2) {
    for (const key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

const groupDb = config.DATABASE.define("groupDB", {
    jid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    antibot: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antifake: {
        type: DataTypes.STRING,
        allowNull: true
    },
    antilink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antiword: {
        type: DataTypes.STRING,
        allowNull: true
    },
    antidemote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antipromote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    filter: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '{}'
    },
    warn: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '{}'
    },
    welcome: {
        type: DataTypes.STRING,
        allowNull: true
    },
    exit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pdm: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    mute: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    unmute: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
});

async function groupDB(type, options, method) {
    if (!Array.isArray(type) || !options.jid || typeof options !== 'object') return;

    let filter = type.map(t => types.find(a => a[t]));
    if (!filter || !filter[0]) return;

    if (['set', 'add', 'delete'].includes(method)) {
        filter = filter[0];
        type = type[0];
    } else {
        filter = filter.filter(a => a !== undefined);
    }

    if (method === 'set' && typeof options.content !== filter[type]) return;
    if (!methods.includes(method)) return;

    let data = await groupDb.findOne({ where: { jid: options.jid } });

    if (!data) {
        if (method === 'set' || method === 'add') {
            const convertRequired = filter[type] === 'object';
            if (convertRequired) options.content = JSON.stringify(options.content);

            data = await groupDb.create({
                jid: options.jid,
                [type]: options.content
            });

            return method === 'add' ? (convertRequired ? JSON.parse(data.dataValues[type]) : data.dataValues[type]) : true;
        } else if (method === 'delete') {
            return false;
        } else {
            const msg = {};
            type.forEach(a => msg[a] = false);
            return msg;
        }
    } else {
        if (method === 'set') {
            const convertRequired = filter[type] === 'object';
            if (convertRequired) options.content = JSON.stringify(options.content);

            await data.update({ [type]: options.content });
            return true;
        } else if (method === 'add') {
            const convertRequired = filter[type] === 'object';
            if (convertRequired) {
                options.content = JSON.stringify(jsonConcat(JSON.parse(data.dataValues[type]), options.content));
            }

            await data.update({ [type]: options.content });
            return convertRequired ? JSON.parse(data.dataValues[type]) : data.dataValues[type];
        } else if (method === 'delete') {
            if (!options.content.id) return;

            const convertRequired = filter[type] === 'object';
            if (convertRequired) {
                const json = JSON.parse(data.dataValues[type]);
                if (!json[options.content.id]) return false;
                delete json[options.content.id];
                options.content = JSON.stringify(json);
            }

            await data.update({ [type]: options.content });
            return true;
        } else {
            const msg = {};
            filter.forEach(t => {
                const key = Object.keys(t)[0];
                const convertRequired = t[key] === 'object';
                const value = convertRequired ? JSON.parse(data.dataValues[key]) : data.dataValues[key];
                msg[key] = value;
            });
            return msg;
        }
    }
}

module.exports = { groupDB, groupDb };
