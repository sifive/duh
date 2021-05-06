'use strict';

const winston = require('winston');

const duhCore = require('duh-core');

const {isInitiator, onInitiator, onTarget} = duhCore.interfaceMode;

const hasCompleteBusType = t =>
  t.vendor && t.library && t.name && t.version;

const vlvnToString = t =>
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

const getPortMap = bi => {
  const rtlObj = (bi.abstractionTypes || [])
    .find(e => (e.viewRef === 'RTLview')) || bi;

  const biPortMaps = rtlObj.portMaps;
  if (typeof biPortMaps !== 'object') {
    console.log(bi);
    throw new Error('undefined portMaps');
  }
  return biPortMaps;
};

const checkPorts = (bd, bi) => {
  const bdPorts = (bd.abstractionDefinition || {}).ports;

  const biPortMaps = getPortMap(bi);

  Object.keys(biPortMaps).map(key => {
    if (!bdPorts[key]) {
      logger.error(bi.name + ':' + key + ' is not defined in: ' + vlvnToString(bi.busType));
    }
  });

  Object.keys(bdPorts).map(key => {
    if (!biPortMaps[key]) {
      const wire = bdPorts[key].wire;
      const onRole = isInitiator(bi.interfaceMode) ? onInitiator(wire) :onTarget(wire);
      const presence = onRole.presence;
      logger.log(
        ((presence === 'required') ? 'error' : 'info'),
        bi.name + ':' + key + ' is unmapped'
      );
      if (presence === 'required') {
        logger.errorCount++;
      }
    }
  });
};

const addCustomBusDefs = (busDef, duh) => {
  if (duh.catalog !== undefined && Array.isArray(duh.catalog.busDefinitions)) {
    const busDefs = duh.catalog.busDefinitions;
    busDefs.map(e => {
      const ad = e.abstractionDefinition;
      const bt = ad.busType;
      const n1 = busDef[bt.vendor] = busDef[bt.vendor] || {};
      const n2 = n1[bt.library] = n1[bt.library] || {};
      const n3 = n2[bt.name] = n2[bt.name] || {};
      n3[bt.version] = e;
    });
  }
};

const checkBusInterface = (busDef, ports) => bi => {
  const t = bi.busType;
  if (typeof t !== 'object') {
    console.log(bi);
    throw new Error('undefined busType');
  }

  const biPortMaps = getPortMap(bi);

  Object.keys(biPortMaps).map(key => {
    let val = biPortMaps[key];
    (Array.isArray(val) ? val : [val]).map(port => {
      const m = port.match(/(\w+)(\[[0-9:]+\])?/);
      const justPort = m[1];
      if (ports[justPort] === undefined) {
        logger.error(bi.name + ':' + key + ' mapped to not existing port: ' + val);
        logger.errorCount++;
      }
    });
  });

  if (!hasCompleteBusType(t)) {
    logger.warn(bi.name + ': has incomplete busType: ' + vlvnToString(t));
    return;
  }
  let bd;
  try {
    bd = busDef[t.vendor];
    bd = bd[t.library];
    bd = bd[t.name];
    bd = bd[t.version];
  } catch (err) {
    logger.warn(bi.name + ': has unknown busType: ' + vlvnToString(t));
    return;
  }
  checkPorts(bd, bi);
};

const checkComponent = busDef => duh => {
  const comp = duh.component;
  // console.log('component: ' + vlvnToString(comp));
  const ports = (comp.model || {}).ports || {};
  (comp.busInterfaces || []).map(checkBusInterface(busDef, ports));
};

module.exports = busDef => {
  function validator (duh) {
    addCustomBusDefs(busDef, duh);
    const compValidator = checkComponent(busDef);
    if (duh.component !== undefined) {
      compValidator(duh);
    } else
    if (duh.catalog !== undefined) {
      (duh.catalog.components || []).map(compValidator);
    }
    return logger.errorCount > 0 ? false : true;
  }
  // validator.errors = {};
  return validator;
};
