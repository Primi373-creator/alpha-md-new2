const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const methods = ["get", "set", "add", "delete"];
const types = [
  { alwaysonline: "string" },
  { anticall: "string" },
  { antidelete: "string" },
  { auto_read_msg: "string" },
  { auto_read_status: "string" },
  { auto_save_status: "string" },
  { autobio: "string" },
  { autoreaction: "string" },
  { disablegrp: "string" },
  { worktype: "string" },
  { disablepm: "string" },
  { tempsudo: "string" },
  { wapresence: "string" },
];
// Define the schema for settings
const settingsSchema = new Schema({
  alwaysonline: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  anticall: {
    type: Schema.Types.Mixed,
    default: "reject"
  },
  antidelete: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  auto_read_msg: {
    type: Schema.Types.Mixed,
    default: "cmd"
  },
  auto_read_status: {
    type: Schema.Types.Mixed,
    default: "true"
  },
  auto_save_status: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  autobio: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  autoreaction: {
    type: Schema.Types.Mixed,
    default: "true"
  },
  disablegrp: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  worktype: {
    type: Schema.Types.Mixed,
    default: "private"
  },
  disablepm: {
    type: Schema.Types.Mixed,
    default: "false"
  },
  tempsudo: {
    type: Schema.Types.Mixed,
    default: ""
  },
  wapresence: {
    type: Schema.Types.Mixed,
    default: "false"
  }
});

// Create the model
const Settings = mongoose.model('Settings', settingsSchema);

// Function to interact with the settings collection
async function settingsDB(type, options, method) {
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

  let data = await Settings.findOne({ _id: options.id });

  if (!data) {
    if (method === "set" || method === "add") {
      const convertRequired = filter[type] === "object";
      if (convertRequired) options.content = JSON.stringify(options.content);

      data = await Settings.create({
        _id: options.id,
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

      await Settings.updateOne({ _id: data._id }, { [type]: options.content });
      return true;
    } else if (method === "add") {
      const convertRequired = filter[type] === "object";
      if (convertRequired) {
        options.content = JSON.stringify(
          jsonConcat(JSON.parse(data[type]), options.content)
        );
      }

      await Settings.updateOne({ _id: data._id }, { [type]: options.content });
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

      await Settings.updateOne({ _id: data._id }, { [type]: options.content });
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

module.exports = { settingsDB, Settings };
