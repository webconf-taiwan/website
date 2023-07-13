<template>
  <div class="flex-col md:flex-row flex min-h-[186px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />
    <div class="w-full md:basis-[90%] flex flex-col md:flex-row gap-2">
      <template v-for="(speaker, index) in formattedArr" :key="index">
        <div
          v-if="speaker !== null"
          class="w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4 speaker-cell"
          :class="{
            'md:block': speaker === null,
            'cursor-pointer': speaker !== null,
          }"
          :data-speakerId="speaker.id"
          @click="() => handleOpenSpeakerModal(speaker.id)"
        >
          <SpeakerCell
            :speechTopic="speaker.speechTopic"
            :id="speaker.id"
            :speakerName="speaker.speakerName"
            :altName="speaker.altName"
            :categoryTags="speaker.categoryTags"
            :room="speaker.room"
          />
        </div>
        <div
          v-if="speaker === null"
          class="hidden md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4"
          :class="{
            'md:block': speaker === null,
          }"
        ></div>
      </template>

      <div
        v-if="isDualSpeaker"
        class="cursor-pointer w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4 speaker-cell"
        @click="() => handleOpenSpeakerModal([DualArr[0].id, DualArr[1].id])"
      >
        <DualSpeakerCell :dualSpeakerInfo="DualArr" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TimelineCell from "@/components/agenda/TimelineCell.vue";
import SpeakerCell from "@/components/agenda/SpeakerCell.vue";
// import { ref, watchEffect} from "vue";
import { computed } from "vue";

import DualSpeakerCell from "@/components/agenda/DualSpeakerCell.vue";

const props = defineProps({
  speakerInfoArr: {
    type: Array,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  onOpenSpeakerModal: {
    type: Function,
  },
});

// const isDualSpeaker = ref(false);

// const formattedArr = ref(JSON.parse(JSON.stringify(props.speakerInfoArr)));
// const DualArr = ref([]);

// watchEffect(() => {
//   if (props.speakerInfoArr.some((speaker) => speaker?.id === "lin-yu-cheng")) {
//     isDualSpeaker.value = true;
//     formattedArr.value = [...props.speakerInfoArr];

//     formattedArr.value = formattedArr.value.filter(
//       (speaker) => speaker?.id !== "lin-yu-cheng" && speaker?.id !== "ke-ren-jie"
//     );

//     DualArr.value = props.speakerInfoArr.filter(
//       (speaker) => speaker?.id === "lin-yu-cheng" || speaker?.id === "ke-ren-jie"
//     );
//   } else {
//     isDualSpeaker.value = false;
//     formattedArr.value = [...props.speakerInfoArr];
//   }
// });

const isDualSpeaker = computed(() =>
  props.speakerInfoArr.some((speaker) => speaker?.id === "lin-yu-cheng")
);

const formattedArr = computed(() => {
  if (isDualSpeaker.value) {
    return props.speakerInfoArr.filter(
      (speaker) => speaker?.id !== "lin-yu-cheng" && speaker?.id !== "ke-ren-jie"
    );
  }

  const nullCount = props.speakerInfoArr.filter((item) => item === null).length;

  if (nullCount > 2) {
    const removeDepNullArr = [...props.speakerInfoArr];
    console.log(removeDepNullArr);
    removeDepNullArr.splice(removeDepNullArr.lastIndexOf(null), 1);

    return removeDepNullArr;
  }

  return props.speakerInfoArr;
});

const DualArr = computed(() => {
  if (isDualSpeaker.value) {
    return props.speakerInfoArr.filter(
      (speaker) => speaker?.id === "lin-yu-cheng" || speaker?.id === "ke-ren-jie"
    );
  }

  return [];
});

const handleOpenSpeakerModal = (speakerId) => {
  if (speakerId) {
    props.onOpenSpeakerModal(speakerId);
  }
};
</script>

<style scoped>
.speaker-cell {
  transition: background-color 0.3s;
}

.speaker-cell:hover {
  background-color: #006a97;
}
</style>
