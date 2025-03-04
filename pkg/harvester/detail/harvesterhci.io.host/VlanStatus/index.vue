<script>
import LabelValue from '@shell/components/LabelValue';
import ArrayListGrouped from '@shell/components/form/ArrayListGrouped';
import { BadgeState } from '@components/BadgeState';

import { _CREATE } from '@shell/config/query-params';
import { findBy } from '@shell/utils/array';

import { HCI } from '../../../types';
import LinkStatus from './LinkStatus';

export default {
  name: 'HarvesterHostNetwork',

  components: {
    LabelValue,
    LinkStatus,
    ArrayListGrouped,
    BadgeState,
  },

  props: {
    value: {
      type:     Object,
      required: true,
    },

    mode: {
      type:    String,
      default: _CREATE,
    },
  },

  computed: {
    conditions() {
      return this.value?.status?.conditions || [];
    },

    readyCondition() {
      return findBy(this.conditions, 'type', 'ready') || {};
    },

    linkStatus() {
      const linkMonitorId = this.value?.status?.linkMonitor;
      const nodeName = this.value?.status?.node;

      const inStore = this.$store.getters['currentProduct'].inStore;
      const linkMonitors = this.$store.getters[`${ inStore }/all`](HCI.LINK_MONITOR);
      const linkMonitor = (linkMonitors.filter((l) => l.id === linkMonitorId) || [])[0] || {};

      return linkMonitor?.status?.linkStatus?.[nodeName] || [];
    },
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col span-12">
        <div class="pull-right">
          {{ t('resourceTabs.conditions.tab') }}:
          <BadgeState
            v-clean-tooltip="readyCondition.message"
            :color="readyCondition.status === 'True' ? 'bg-success' : 'bg-error' "
            :icon="readyCondition.status === 'True' ? 'icon-checkmark' : 'icon-warning' "
            :label="t('tableHeaders.ready')"
            class="mr-10 ml-10 state"
          />
        </div>
      </div>
    </div>
    <div class="row mt-10">
      <div class="col span-6">
        <LabelValue
          :name="t('harvester.network.clusterNetwork.label')"
          :value="value.status.clusterNetwork"
        />
      </div>
      <div class="col span-6">
        <LabelValue
          :name="t('harvester.vlanStatus.vlanConfig.label')"
          :value="value.status.vlanConfig"
        />
      </div>
    </div>
    <div class="row mt-20">
      <div class="col span-12">
        <ArrayListGrouped
          v-model:value="linkStatus"
          :mode="mode"
          :can-remove="false"
        >
          <template #default="props">
            <LinkStatus
              :value="props.row.value"
              :mode="mode"
            />
          </template>
        </ArrayListGrouped>
      </div>
    </div>
  </div>
</template>
