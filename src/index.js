// Agent Mind CLI main router
// Exports command modules for dispatch

module.exports = {
  commands: {
    init: require('./commands/init').init,
    upgrade: require('./commands/upgrade').upgrade,
    doctor: require('./commands/doctor').doctor,
    version: require('./commands/meta').version,
    help: require('./commands/meta').help
  },
  utils: {
    detectTools: require('./utils/detect-tools'),
    template: require('./utils/template'),
    version: require('./utils/version'),
    injectAdapter: require('./utils/inject-adapter')
  }
};
