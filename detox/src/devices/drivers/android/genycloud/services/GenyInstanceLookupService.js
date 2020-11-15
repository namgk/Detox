const _ = require('lodash');
const Instance = require('./dto/GenyInstance');

class GenyInstanceLookupService {
  constructor(genyCloudExec, instanceNaming, genycloudDeviceRegistry) {
    this.genyCloudExec = genyCloudExec;
    this.instanceNaming = instanceNaming;
    this.deviceRegistry = genycloudDeviceRegistry;
  }

  async findFreeInstance() {
    const freeInstances = await this._getRelevantInstances();
    return (freeInstances[0] || null);
  }

  async getInstance(instanceUUID) {
    const instances = await this._getAllInstances();
    return _.find(instances, (instance) => instance.uuid === instanceUUID);
  }

  async _getRelevantInstances() {
    const takenDevices = this.deviceRegistry.getRegisteredInstanceUUIDs();
    const isRelevant = (instance) =>
      (instance.isOnline() || instance.isInitializing()) &&
      this.instanceNaming.isFamilial(instance.name) &&
      !takenDevices.includes(instance.uuid);

    const instances = await this._getAllInstances();
    return instances.filter(isRelevant);
  }

  async _getAllInstances() {
    return (await this.genyCloudExec.getInstances())
      .instances
      .map((rawInstance) => new Instance(rawInstance));
  }
}

module.exports = GenyInstanceLookupService;
