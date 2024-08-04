const { Sequelize, DataTypes } = require("sequelize");
const config = require("../../config");

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

const Settings = config.DATABASE.define("settings", {
  alwaysonline: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  anticall: {
    type: DataTypes.STRING,
    defaultValue: "reject",
  },
  antidelete: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  auto_read_msg: {
    type: DataTypes.STRING,
    defaultValue: "cmd",
  },
  auto_read_status: {
    type: DataTypes.STRING,
    defaultValue: "true",
  },
  auto_save_status: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  autobio: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  autoreaction: {
    type: DataTypes.STRING,
    defaultValue: "true",
  },
  disablegrp: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  worktype: {
    type: DataTypes.STRING,
    defaultValue: "private",
  },
  disablepm: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
  tempsudo: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  wapresence: {
    type: DataTypes.STRING,
    defaultValue: "false",
  },
});

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

  let data = await Settings.findOne({ where: { id: options.id } });

  if (!data) {
    if (method === "set" || method === "add") {
      const convertRequired = filter[type] === "object";
      if (convertRequired) options.content = JSON.stringify(options.content);

      data = await Settings.create({
        id: options.id,
        [type]: options.content,
      });

      return method === "add"
        ? (convertRequired ? JSON.parse(data.dataValues[type]) : data.dataValues[type])
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

      await data.update({
        [type]: options.content,
      });
      return true;
    } else if (method === "add") {
      const convertRequired = filter[type] === "object";
      if (convertRequired) {
        options.content = JSON.stringify(
          jsonConcat(JSON.parse(data.dataValues[type]), options.content)
        );
      }

      await data.update({
        [type]: options.content,
      });
      return convertRequired
        ? JSON.parse(data.dataValues[type])
        : data.dataValues[type];
    } else if (method === "delete") {
      if (!options.content.id) return;

      const convertRequired = filter[type] === "object";
      if (convertRequired) {
        const json = JSON.parse(data.dataValues[type]);
        if (!json[options.content.id]) return false;
        delete json[options.content.id];
        options.content = JSON.stringify(json);
      }

      await data.update({
        [type]: options.content,
      });
      return true;
    } else {
      const msg = {};
      filter.forEach(t => {
        const key = Object.keys(t)[0];
        const convertRequired = t[key] === "object";
        const value = convertRequired
          ? JSON.parse(data.dataValues[key])
          : data.dataValues[key];
        msg[key] = value;
      });
      return msg;
    }
  }
}

module.exports = { settingsDB };