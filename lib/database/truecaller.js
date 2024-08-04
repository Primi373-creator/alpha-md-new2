const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trueCallerSchema = new Schema({
  key: {
    type: Schema.Types.Mixed,
    default: null
  },
  token: {
    type: Schema.Types.Mixed,
    default: null
  },
  number: {
    type: Schema.Types.Mixed,
    default: null
  }
});

const TrueCaller = mongoose.model('TrueCaller', trueCallerSchema);

async function setTrueCallerkey(opt = {}) {
  const truecaller = await TrueCaller.findOne();
  if (!truecaller) {
    await TrueCaller.create({
      key: opt.key,
      token: opt.token,
      number: opt.number
    });
    return 'created';
  } else {
    await truecaller.updateOne({
      key: opt.key,
      token: opt.token,
      number: opt.number
    });
    return 'updated';
  }
}

async function getTrueCallertoken() {
  const truecaller = await TrueCaller.findOne();
  if (truecaller) {
    return {
      key: truecaller.key,
      token: truecaller.token,
      number: truecaller.number
    };
  } else {
    return {
      key: false,
      token: false,
      number: false
    };
  }
}

async function TrueLogout() {
  await TrueCaller.deleteMany({});
  return true;
}

module.exports = { setTrueCallerkey, getTrueCallertoken, TrueLogout };