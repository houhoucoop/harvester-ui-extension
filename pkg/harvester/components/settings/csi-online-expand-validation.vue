<script>
import { _EDIT } from '@shell/config/query-params';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import InfoBox from '@shell/components/InfoBox';
import { allHash } from '@shell/utils/promise';
import { CSI_DRIVER } from '../../types';
import { LONGHORN_DRIVER } from '@shell/config/types';

export default {
  name: 'CSIOnlineExpandValidation',

  components: {
    InfoBox,
    LabeledSelect,
  },

  props: {
    mode: {
      type:    String,
      default: _EDIT,
    },
    value: {
      type:    Object,
      default: () => ({}),
    },
    registerBeforeHook: {
      type:     Function,
      required: true,
    },
  },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    await allHash({ csiDrivers: this.$store.dispatch(`${ inStore }/findAll`, { type: CSI_DRIVER }) });
  },

  data() {
    const initValue = this.value.value || this.value.default || '{}';

    return { configArr: this.parseValue(initValue) };
  },

  created() {
    this.registerBeforeHook?.(this.willSave, 'willSave');
  },

  computed: {
    inStore() {
      return this.$store.getters['currentProduct'].inStore;
    },

    csiDrivers() {
      return this.$store.getters[`${ this.inStore }/all`](CSI_DRIVER) || [];
    },

    provisioners() {
      const usedKeys = this.configArr.map(({ key }) => key);

      return this.csiDrivers
        .filter(({ name }) => !usedKeys.includes(name))
        .map(({ name }) => name);
    },

    provisionerValue() {
      return [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ];
    },

    disableAdd() {
      return this.configArr.length >= this.csiDrivers.length;
    },
  },

  methods: {
    parseValue(raw) {
      try {
        const json = JSON.parse(raw);

        return Object.entries(json).map(([key, value]) => ({
          key,
          value: value === 'true' ? true : value === 'false' ? false : value,
        }));
      } catch {
        // eslint-disable-next-line no-console
        console.warn('[CSIOnlineExpandValidation] Invalid JSON:', raw);

        return [];
      }
    },

    stringifyConfig() {
      const obj = {};

      this.configArr.forEach(({ key, value }) => {
        obj[key] = value;
      });

      return this.configArr.length ? JSON.stringify(obj) : '';
    },

    update() {
      this.value.value = this.stringifyConfig();
    },

    willSave() {
      const errors = [];

      this.configArr.forEach(({ key }) => {
        if (!key) {
          errors.push(
            this.t('validation.required', { key: this.t('harvester.setting.csiOnlineExpandValidation.provisioner') }, true)
          );
        }
      });

      this.value.value = this.stringifyConfig();

      return errors.length ? Promise.reject(errors) : Promise.resolve();
    },

    disableEdit(driverKey) {
      return driverKey === LONGHORN_DRIVER;
    },

    add() {
      this.configArr.push({ key: '', value: true });
    },

    remove(index) {
      this.configArr.splice(index, 1);
      this.update();
    },

    useDefault() {
      this.configArr = this.parseValue(this.value.default || '{}');
      this.update();
    },

    onValueChange(idx, newVal) {
      const val = newVal === 'true' ? true : newVal === 'false' ? false : newVal;

      this.configArr[idx].value = val;
      this.update();
    },
  },
};
</script>

<template>
  <div>
    <InfoBox
      v-for="(driver, idx) in configArr"
      :key="idx"
      class="box"
    >
      <button
        class="role-link btn btn-sm remove"
        type="button"
        :disabled="disableEdit(driver.key)"
        @click="remove(idx)"
      >
        <i class="icon icon-x" />
      </button>

      <div class="row">
        <div class="col span-4">
          <LabeledSelect
            v-model:value="driver.key"
            label-key="harvester.setting.csiOnlineExpandValidation.provisioner"
            required
            searchable
            :mode="mode"
            :disabled="disableEdit(driver.key)"
            :options="provisioners"
            @update:value="update"
            @keydown.native.enter.prevent
          />
        </div>

        <div class="col span-4">
          <LabeledSelect
            v-model:value="driver.value"
            :value="driver.value.toString()"
            label-key="harvester.setting.csiOnlineExpandValidation.value"
            required
            searchable
            :mode="mode"
            :disabled="disableEdit(driver.key)"
            :options="provisionerValue"
            @update:value="val => onValueChange(idx, val)"
            @keydown.native.enter.prevent
          />
        </div>
      </div>
    </InfoBox>

    <button
      class="btn btn-sm role-primary"
      :disabled="disableAdd"
      @click="add"
    >
      {{ t('generic.add') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.box {
  position: relative;
  padding-top: 40px;
}
.remove {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0;
}
</style>
