import SteveSchema from '@shell/models/steve-schema';

/**
 * This is the steve schema that's used for the harvester store
 */
export default class HarvesterStoreSchema extends SteveSchema {
  constructor(...args) {
    if (args[0].type === 'schema') {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    super(...args);
  }
}
