<script lang="ts" setup>
import Card3d from '~/components/ui/card3d/Index.vue'
import { staffData } from '~/constants/staff'
</script>

<template>
  <ul class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:gap-y-16 xl:grid-cols-4">
    <li
      v-for="staff in staffData"
      :key="staff.name"
      class=" w-full p-4"
    >
      <Card3d>
        <StaffCard :staff="staff" />
      </Card3d>
    </li>
  </ul>
</template>
