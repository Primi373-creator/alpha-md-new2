const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

const groupSchema = new Schema({
    jid: {
        type: String,
        required: true
    },
    antibot: {
        type: Schema.Types.Mixed, 
        default: 'false'
    },
    antifake: {
        type: Schema.Types.Mixed 
    },
    antilink: {
        type: Schema.Types.Mixed, 
        default: 'false'
    },
    antiword: {
        type: Schema.Types.Mixed 
    },
    antidemote: {
        type: Schema.Types.Mixed, 
        default: 'false'
    },
    antipromote: {
        type: Schema.Types.Mixed, 
        default: 'false'
    },
    filter: {
        type: Schema.Types.Mixed, 
        default: {}
    },
    warn: {
        type: Schema.Types.Mixed, 
        default: {}
    },
    welcome: {
        type: Schema.Types.Mixed 
    },
    exit: {
        type: Schema.Types.Mixed 
    },
    pdm: {
        type: Schema.Types.Mixed, 
        default: 'false'
    },
    mute: {
        type: Schema.Types.Mixed, 
        default: ''
    },
    unmute: {
        type: Schema.Types.Mixed, 
        default: ''
    }
});

const Group = mongoose.model('Group', groupSchema);

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

    let data = await Group.findOne({ jid: options.jid });

    if (!data) {
        if (method === 'set' || method === 'add') {
            const convertRequired = filter[type] === 'object';
            if (convertRequired) options.content = JSON.stringify(options.content);

            data = await Group.create({
                jid: options.jid,
                [type]: options.content
            });

            return method === 'add' ? (convertRequired ? JSON.parse(data[type]) : data[type]) : true;
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

            await Group.updateOne({ jid: options.jid }, { [type]: options.content });
            return true;
        } else if (method === 'add') {
            const convertRequired = filter[type] === 'object';
            if (convertRequired) {
                options.content = JSON.stringify(jsonConcat(JSON.parse(data[type]), options.content));
            }

            await Group.updateOne({ jid: options.jid }, { [type]: options.content });
            return convertRequired ? JSON.parse(data[type]) : data[type];
        } else if (method === 'delete') {
            if (!options.content.id) return;

            const convertRequired = filter[type] === 'object';
            if (convertRequired) {
                const json = JSON.parse(data[type]);
                if (!json[options.content.id]) return false;
                delete json[options.content.id];
                options.content = JSON.stringify(json);
            }

            await Group.updateOne({ jid: options.jid }, { [type]: options.content });
            return true;
        } else {
            const msg = {};
            filter.forEach(t => {
                const key = Object.keys(t)[0];
                const convertRequired = t[key] === 'object';
                const value = convertRequired ? JSON.parse(data[key]) : data[key];
                msg[key] = value;
            });
            return msg;
        }
    }
}

module.exports = { groupDB, Group };