<template>
  <div class="dartboard">
    <div
      class="dartboard-row"
      v-for="row in dartboardLayout"
      :key="row.join('-')"
    >
      <button
        v-for="num in row"
        :key="num"
        @click="$emit('add-dart', num)"
        :disabled="isDisabled(num)"
        class="dartboard-number"
      >
        {{ num }}
      </button>
    </div>

    <div class="last-row">
      <button
        :class="{ selected: multiplier === 2 }"
        class="double-button"
        @click="$emit('toggle-multiplier', 2)"
      >
        DOUBLE
      </button>
      <button
        :class="{ selected: multiplier === 3 }"
        class="triple-button"
        @click="$emit('toggle-multiplier', 3)"
      >
        TRIPLE
      </button>
      <button class="back-button" @click="$emit('undo-dart')">BACK</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dartboardLayout: Array,
    multiplier: Number,
  },
  methods: {
    isDisabled(num) {
      return (
        (num === 25 && this.multiplier === 3) ||
        (num === 0 && this.multiplier >= 2)
      );
    },
  },
};
</script>
