<script>
import ArrayList from '@shell/components/form/ArrayList';
import Select from '@shell/components/form/Select';
import LabeledInput from '@components/Form/LabeledInput/LabeledInput.vue';

export default {
  name: 'HarvesterFilterLabel',

  emits: ['changeRows'],

  components: {
    Select,
    ArrayList,
    LabeledInput
  },

  props: {
    rows: {
      type:     Array,
      required: true,
    },
  },

  data() {
    return {
      searchLabels:    [],
      defaultAddValue: {
        key:   '',
        value: '',
      }
    };
  },

  computed: {
    optionLabels() {
      const labels = this.rows.map((row) => {
        return Object.keys(row.labels);
      });

      return Array.from(new Set(labels.flat()));
    },
  },

  methods: {
    calcValueOptions(key) {
      const valueOptions = [];

      this.rows.map((row) => {
        const isExistValue = valueOptions.find((value) => value.label === row.labels[key]);

        if (Object.keys(row.labels).includes(key) && key && row.labels[key] && !isExistValue) {
          valueOptions.push({
            value: row.labels[key],
            label: row.labels[key]
          });
        }
      });

      return valueOptions;
    },

    removeAll() {
      this['searchLabels'] = [];
      this.filterRows();
    },

    remove(label) {
      this.searchLabels.find((L, index) => {
        if (L.key === label.key && L.value === label.value) {
          this.searchLabels.splice(index, 1);
          this.filterRows();

          return true;
        }
      });
    },

    filterRows() {
      const rows = this.rows.filter((row) => {
        const hasSearch = this.searchLabels.find((search) => search.key);

        if (!hasSearch) {
          return this.rows;
        }

        const labels = row.labels;
        const keys = Object.keys(labels);

        return this.searchLabels.find((search) => {
          if (search.key && keys.includes(search.key)) {
            if (!search.value) { // If value is empty, all data containing the key is retained
              return true;
            } else if (search.value === labels[search.key]) {
              return true;
            } else if (search.value !== labels[search.key]) {
              return false;
            }
          } else {
            return false;
          }
        });
      });

      this.$emit('changeRows', rows, this.searchLabels);
    }
  },

  watch: {
    rows: {
      deep:      true,
      immediate: true,
      handler() {
        this.filterRows();
      }
    }
  }
};
</script>

<template>
  <div class="filter">
    <template
      v-for="(label, index) in searchLabels"
      :key="index"
    >
      <span
        v-if="label.key"
        :key="`${label.key}${index}`"
        class="banner-item bg-warning"
      >
        {{ label.key }}{{ label.value ? "=" : '' }}{{ label.value }}<i
          class="icon icon-close"
          @click="remove(label)"
        />
      </span>
    </template>

    <v-dropdown
      popper-class="filter-label"
      trigger="click"
      placement="bottom-end"
      :distance="20"
    >
      <slot name="header">
        <button
          ref="actionDropDown"
          class="btn bg-primary mr-10"
        >
          <slot name="title">
            {{ t('harvester.fields.filterLabels') }}
          </slot>
        </button>
      </slot>

      <template #popper>
        <div class="filter-popup">
          <div>
            <ArrayList
              v-model:value="searchLabels"
              :show-header="true"
              :default-add-value="defaultAddValue"
              :initial-empty-row="true"
              @update:value="filterRows"
            >
              <template #column-headers>
                <div class="box">
                  <div class="key">
                    {{ t('generic.key') }}
                    <span class="required">*</span>
                  </div>
                  <div class="value">
                    {{ t('generic.value') }}
                  </div>
                  <div />
                </div>
              </template>
              <template #columns="scope">
                <div class="key">
                  <Select
                    ref="select"
                    key="label"
                    v-model:value="scope.row.value.key"
                    :append-to-body="false"
                    :searchable="true"
                    :options="optionLabels"
                    @update:value="filterRows"
                  />
                </div>
                <div class="value">
                  <Select
                    v-if="calcValueOptions(scope.row.value.key).length > 0"
                    ref="select"
                    key="value"
                    v-model:value="scope.row.value.value"
                    :append-to-body="false"
                    :searchable="true"
                    :options="calcValueOptions(scope.row.value.key)"
                    @update:value="filterRows"
                  />
                  <LabeledInput
                    v-else
                    v-model:value="scope.row.value.value"
                    @update:value="filterRows"
                  />
                </div>
              </template>

              <template #add="{add}">
                <div>
                  <button
                    type="button"
                    class="btn role-tertiary add"
                    data-testid="add-item"
                    @click="add()"
                  >
                    {{ t('generic.add') }}
                  </button>

                  <button
                    type="button"
                    class="btn role-tertiary add"
                    data-testid="remove-all-item"
                    @click="removeAll()"
                  >
                    {{ t('generic.clearAll') }}
                  </button>
                </div>
              </template>
            </ArrayList>
          </div>
        </div>
      </template>
    </v-dropdown>
  </div>
</template>

<style lang="scss" scoped>
.filter {
  display: inline-block;

  .banner-item {
    display: inline-block;
    font-size: 16px;
    margin-right: 10px;
    padding: 6px;
    border-radius: 2px;

    i {
      cursor: pointer;
      vertical-align: middle;
    }
  }
}
.filter-popup {
  width: 600px;
}

:deep() .box {
  display: grid;
  grid-template-columns: 40% 40% 10%;
  column-gap: 1.75%;
  margin-bottom: 10px;
}

.required {
  color: var(--error);
}
</style>

<style lang="scss">
.filter-label .v-popper__arrow-container {
  display: none;
}
</style>
