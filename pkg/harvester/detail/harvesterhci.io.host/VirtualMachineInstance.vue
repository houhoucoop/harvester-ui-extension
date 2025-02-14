<script>
import { STATE, AGE, NAME } from '@shell/config/table-headers';
import SortableTable from '@shell/components/SortableTable';
import Loading from '@shell/components/Loading';
import { allHash } from '@shell/utils/promise';
import { HOSTNAME } from '@shell/config/labels-annotations';
import HarvesterVmState from '../../formatters/HarvesterVmState';
import { HCI } from '../../types';

export default {
  name: 'InstanceNode',

  components: {
    SortableTable,
    Loading,
    HarvesterVmState,
  },

  props: {
    node: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const hash = await allHash({
      vms:               this.$store.dispatch('harvester/findAll', { type: HCI.VM }),
      vmis:              this.$store.dispatch('harvester/findAll', { type: HCI.VMI }),
      allClusterNetwork: this.$store.dispatch('harvester/findAll', { type: HCI.CLUSTER_NETWORK }),
    });
    const instanceMap = {};

    (hash.vmis || []).forEach((vmi) => {
      const vmiUID = vmi?.metadata?.ownerReferences?.[0]?.uid;

      if (vmiUID) {
        instanceMap[vmiUID] = vmi;
      }
    });

    this.allClusterNetwork = hash.allClusterNetwork;
    this.rows = hash.vms.filter((row) => {
      return instanceMap[row.metadata?.uid]?.status?.nodeName === this.node?.metadata?.labels?.[HOSTNAME];
    });
  },

  data() {
    return {
      rows:              [],
      allClusterNetwork: []
    };
  },

  computed: {
    headers() {
      return [
        STATE,
        NAME,
        {
          name:     'vmCPU',
          labelKey: 'tableHeaders.cpu',
          search:   false,
          sort:     ['spec.template.spec.domain.cpu.cores'],
          value:    'spec.template.spec.domain.cpu.cores',
          width:    120
        },
        {
          name:     'vmRAM',
          labelKey: 'glance.memory',
          search:   false,
          sort:     ['memorySort'],
          value:    'spec.template.spec.domain.resources.limits.memory',
          width:    120
        },
        {
          name:      'ip',
          label:     'IP Address',
          labelKey:  'harvester.tableHeaders.vm.ipAddress',
          value:     'id',
          formatter: 'HarvesterIpAddress'
        },
        {
          ...AGE,
          sort: 'metadata.creationTimestamp:desc',
        }
      ];
    },
  },

  methods: {}
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div
    v-else
    id="host-instances"
    class="row"
  >
    <div class="col span-12">
      <SortableTable
        v-bind="$attrs"
        :headers="headers"
        default-sort-by="age"
        :rows="rows"
        key-field="_key"
      >
        <template
          #cell:state="scope"
          class="state-col"
        >
          <div class="state">
            <HarvesterVmState
              class="vmstate"
              :row="scope.row"
              :all-cluster-network="allClusterNetwork"
            />
          </div>
        </template>
      </Sortabletable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#host-instances {
  :deep() thead th {
    vertical-align: middle;
  }

  :deep() .state {
    display: flex;

    .vmstate {
      margin-right: 6px;
    }
  }
}
</style>
