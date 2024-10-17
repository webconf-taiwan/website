<script setup lang="ts">
const agendaDateTextMap = [
  ['2024-12-27', '(FRI.)'],
  ['2024-12-28', '(SAT.)'],
]
</script>

<template>
  <Tabs
    :default-value="agendaDateTextMap[0][0]"
    class="left-0 top-0 w-full"
  >
    <TabsList class="sticky left-0 top-[3.75rem] w-full lg:static">
      <TabsTrigger
        v-for="(date, index) in agendaDateTextMap"
        :key="date[0]"
        class="w-full font-['Mina'] text-xl font-bold leading-none data-[state=active]:z-10 lg:text-[2rem]"
        :class="[index === 0 ? 'before:origin-bottom-left' : 'before:origin-bottom-right']"
        :value="date[0]"
      >
        <div
          class="relative z-10 flex items-center justify-center gap-x-2 truncate"
        >
          <span>{{ useDateFormat(date[0], 'MM/DD') }}</span> <span class="lg:text-2xl">{{ date[1] }}</span>
        </div>
      </TabsTrigger>
    </TabsList>

    <TabsContent
      v-for="(date, index) in agendaDateTextMap"
      :key="date[0]"
      class="min-h-[100dvh]"
      :value="date[0]"
    >
      {{ date[0] }} 議程內容
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
