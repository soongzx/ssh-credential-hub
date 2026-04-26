<script setup lang="ts">
import { NSpace, NLayout, NLayoutHeader, NLayoutContent, NText } from 'naive-ui'
</script>

<template>
  <NLayout style="height: 100vh">
    <NLayoutHeader bordered style="height: 48px; padding: 0 24px">
      <NSpace align="center" style="height: 100%">
        <NText strong style="font-size: 16px">SSH Credential Hub</NText>
      </NSpace>
    </NLayoutHeader>
    <NLayoutContent style="padding: 24px">
      <NSpace vertical>
        <NText>欢迎使用 SSH Credential Hub</NText>
        <NText depth="3">项目脚手架初始化完成</NText>
      </NSpace>
    </NLayoutContent>
  </NLayout>
</template>
