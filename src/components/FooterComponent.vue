<template>
  <footer class="bg-custom-gray-800 p-6 md:px-8 md:py-3 ">
    <div class="flex flex-col items-center md:flex-row md:justify-between">
        <ul class="flex">
            <li><a href="mailto:hi@webconf.tw" class="text-custom-teal-500 text-sm font-medium font-rajdhani py-1 px-4 border-r border-custom-teal-700 md:border-r-0 whitespace-nowrap hover:text-custom-teal-700 flex items-center"><div class="mailIcon w-4 h-4 bg-cover mr-1"></div>
            <p>hi@webconf.tw</p></a></li>
            <li class="md:hidden"><a href="#" class="text-custom-teal-500 text-sm font-medium py-1 px-4 border-r border-custom-teal-700 whitespace-nowrap hover:text-custom-teal-700" onclick="event.preventDefault();">行為準則</a></li>
            <li class="md:hidden"><a href="#" class="text-custom-teal-500 text-sm font-medium font-rajdhani py-1 px-4 whitespace-nowrap hover:text-custom-teal-700" onclick="event.preventDefault();">COVID19 Policy</a></li>
        </ul>
        <div class="flex items-center mt-2 md:mb-0">
            <div class="fbIcon w-6 h-6 bg-cover"></div>
            <div class="m-2 w-10 h-0.5 bg-custom-teal-500"></div>
            <p class="text-custom-teal-500 text-sm font-medium font-rajdhani">WebConf Taiwan 2023 All Rights Reserved.</p>
        </div>
        <ul class="md:flex mr-14">
            <li class="hidden md:block"><a href="#" onclick="event.preventDefault();" class="text-custom-teal-500 text-sm font-medium py-1 px-4 border-r border-custom-teal-700 hover:text-custom-teal-700">行為準則</a></li>
            <li class="hidden md:block"><a href="#" onclick="event.preventDefault();" class="text-custom-teal-500 text-sm font-medium font-rajdhani py-1 px-4 hover:text-custom-teal-700">COVID19 Policy</a></li>
        </ul>
    </div>
  </footer>
</template>

<style scoped>
  .fbIcon {
    background-image: url('src/assets/images/icon/ic_fb_l.svg');
  }
  .mailIcon {
    background-image: url('src/assets/images/icon/ic_mail_s.svg');
  }
</style>

<script setup>


</script>