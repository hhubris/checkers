<script setup lang="ts">
import { watchEffect } from 'vue'
import { useSettingsStore } from './stores/settingsStore'

const settings = useSettingsStore()

// Apply the theme attribute whenever settings.theme changes, and
// immediately on mount. This is the single canonical site for this
// DOM side-effect; all other setAttribute calls have been removed.
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', settings.theme)
})
</script>

<template>
  <RouterView />
</template>
