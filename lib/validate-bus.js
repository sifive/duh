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
        bi.name + ':' + key + ' is unmapped');
    }
  });
};

module.exports = busDef =>
  function validator (duh) {
    const comp = duh.component || {};
    const bis = comp.busInterfaces || [];
    bis.map(bi => {
      const t = bi.busType || {};
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
      checkPorts(bd, bi, comp);
    });
    // validator.errors = {};
    return true;
  };
