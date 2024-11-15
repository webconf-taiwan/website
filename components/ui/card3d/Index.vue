<script lang="ts" setup>
import CardBody from './CardBody.vue'
import CardContainer from './CardContainer.vue'
</script>

<template>
  <ClientOnly>
    <CardContainer>
      <CardBody>
        <slot></slot>
      </CardBody>
    </CardContainer>
  </ClientOnly>
</template>
