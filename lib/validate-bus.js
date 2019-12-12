'use strict';

const winston = require('winston');

const capitalize = str => str[0].toUpperCase() + str.slice(1);

const hasCompleteBusType = t =>
  t.vendor && t.library && t.name && t.version;

const busTypeToString = t =>
  t.vendor + ':' + t.library + ':' + t.name + ':' + t.version;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

logger.errorCount = 0;

const checkPorts = (bd, bi) => {
  const bdPorts = (bd.abstractionDefinition || {}).ports;
  const biPortMaps = (bi.abstractionTypes || []).find(e => (e.viewRef === 'RTLview')).portMaps;
  const interfaceMode = 'on' + capitalize(bi.interfaceMode);

  Object.keys(biPortMaps).map(key => {
    if (!bdPorts[key]) {
      logger.info(bi.name + ':' + key + ' is not defined in: ' + busTypeToString(bi.busType));
    }
  });

  Object.keys(bdPorts).map(key => {
    if (!biPortMaps[key]) {
      const presence = bdPorts[key].wire[interfaceMode].presence;
      logger.log(
        ((presence === 'optional') ? 'info' : 'error'),
        bi.name + ':' + key + ' is unmapped'
      );
      if (presence === 'required') {
        logger.errorCount++;
      }
    }
  });
};

module.exports = busDef =>
  function validator (duh) {
    const comp = duh.component || {};
    const bis = comp.busInterfaces || [];
    const ports = (comp.model || {}).ports || {};

    bis.map(bi => {
      const t = bi.busType || {};
      const biPortMaps = (bi.abstractionTypes || []).find(e => (e.viewRef === 'RTLview')).portMaps;

      Object.keys(biPortMaps).map(key => {
        if (ports[biPortMaps[key]] === undefined) {
          logger.error(bi.name + ':' + key + ' mapped to not existing port: ' + biPortMaps[key]);
          logger.errorCount++;
        }
      });

      if (!hasCompleteBusType(t)) {
        logger.warn(bi.name + ': has incomplete busType: ' + busTypeToString(t));
        return;
      }
      let bd;
      try {
        bd = busDef[t.vendor];
        bd = bd[t.library];
        bd = bd[t.name];
        bd = bd[t.version];
      } catch (err) {
        logger.warn(bi.name + ': has unknown busType: ' + busTypeToString(t));
        return;
      }
      checkPorts(bd, bi);
    });
    // validator.errors = {};
    return logger.errorCount > 0 ? false : true;
  };
