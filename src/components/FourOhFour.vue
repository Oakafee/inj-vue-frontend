<template>
<h2 class="inj-four-oh-four">404: Page Not Found </h2>
</template>

<script>

export default {
  name: 'FourOhFour',
  props: {
    msg: String
  },
  data: function () {
    return {
      map: '',
	}
  },
}
</script>

<style lang="scss">
.inj-four-oh-four {
	text-align: center;
}
</style>