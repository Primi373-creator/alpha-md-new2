const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const methods = ["get", "set", "add", "delete"];
const types = [
  { mention: "object" },
  { ban: "string" },
  { alive: "string" },
  { login: "string" },
  { shutoff: "string" },
  { owner_updt: "string" },
  { commit_key: "string" },
  { sticker_cmd: "object" },
  { plugins: "object" },
  { toggle: "object" },
];


const personalSchema = new Schema({
    mention: {
        type: Schema.Types.Mixed, 
        default: null
    },
    ban: {
        type: Schema.Types.Mixed, 
        default: null
    },
    alive: {
        type: Schema.Types.Mixed, 
        default: "_Hold on &sender senpai, let me check my circuits. Beep boop... yep, i am alive!_"
    },
    login: {
        type: Schema.Types.Mixed, 
        default: null
    },
    shutoff: {
        type: Schema.Types.Mixed, 
        default: null
    },
    owner_updt: {
        type: Schema.Types.Mixed, 
        default: null
    },
    commit_key: {
        type: Schema.Types.Mixed, 
        default: null
    },
    sticker_cmd: {
        type: Schema.Types.Mixed, 
        default: {}
    },
    plugins: {
        type: Schema.Types.Mixed, 
        default: {}
    },
    toggle: {
        type: Schema.Types.Mixed, 
        default: {}
    }
});

const Personal = mongoose.model('Personal', personalSchema);

async function personalDB(type, options, method) {
    if (!Array.isArray(type) || typeof options !== "object") return;

    let filter = type.map(t => types.find(a => a[t]));
    if (!filter || !filter[0]) return;

    if (["set", "add", "delete"].includes(method)) {
        filter = filter[0];
        type = type[0];
    } else {
        filter = filter.filter(a => a !== undefined);
    }

    if (method === "set" && typeof options.content !== filter[type]) return;
    if (!methods.includes(method)) return;

    let data = await Personal.findOne();

    if (!data) {
        if (method === "set" || method === "add") {
            const convertRequired = filter[type] === "object";
            if (convertRequired) options.content = JSON.stringify(options.content);

            data = await Personal.create({
                [type]: options.content
            });

            return method === "add"
                ? (convertRequired ? JSON.parse(data[type]) : data[type])
                : true;
        } else if (method === "delete") {
            return false;
        } else {
            const msg = {};
            type.forEach(a => {
                msg[a] = false;
            });
            return msg;
        }
    } else {
        if (method === "set") {
            const convertRequired = filter[type] === "object";
            if (convertRequired) options.content = JSON.stringify(options.content);

            await Personal.updateOne({
                _id: data._id
            }, {
                [type]: options.content
            });
            return true;
        } else if (method === "add") {
            const convertRequired = filter[type] === "object";
            if (convertRequired) {
                options.content = JSON.stringify(
                    jsonConcat(JSON.parse(data[type]), options.content)
                );
            }

            await Personal.updateOne({
                _id: data._id
            }, {
                [type]: options.content
            });
            return convertRequired
                ? JSON.parse(data[type])
                : data[type];
        } else if (method === "delete") {
            if (!options.content.id) return;

            const convertRequired = filter[type] === "object";
            if (convertRequired) {
                const json = JSON.parse(data[type]);
                if (!json[options.content.id]) return false;
                delete json[options.content.id];
                options.content = JSON.stringify(json);
            }

            await Personal.updateOne({
                _id: data._id
            }, {
                [type]: options.content
            });
            return true;
        } else {
            const msg = {};
            filter.forEach(t => {
                const key = Object.keys(t)[0];
                const convertRequired = t[key] === "object";
                const value = convertRequired
                    ? JSON.parse(data[key])
                    : data[key];
                msg[key] = value;
            });
            return msg;
        }
    }
}

module.exports = { personalDB, Personal };