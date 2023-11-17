<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { Remarkable } from 'remarkable'
import VueMarkdown, { Options } from 'vue-markdown-render'
const textContent = ref(`
### This is a simple Markdown document

> It's really just here to make sure the Remarkable CLI can take a Markdown
> document as an input

**It's not comprehensive or anything**

--- 

Hopefully the CLI can handle it though
`)
const isDark = useDark()
const toggleDark = useToggle(isDark)
const md = new Remarkable('full')
const renderText = ref('')
const options: Options = { html: true }
watch(textContent, (newVal) => {
  const toStr = JSON.stringify(newVal)
  const replaceEnter = toStr.replace(/\\n/g, '  \n')
  const str = replaceEnter.substring(1, replaceEnter.length - 1)
  renderText.value = md.render(str)
})
onMounted(() => {
  const toStr = JSON.stringify(textContent.value)
  console.log(toStr)
  renderText.value = md.render(textContent.value)
})
</script>

<template>
  <main py-10 text-center h-full flex-col>
    <div h-sm md:h-2xl text-20 md:text-40>
      <p>
        <i @click="toggleDark()" icon-btn dark:i-carbon-moon i-carbon-sun text-30 md:text-40 />
      </p>
      <div f-c-c gap-20 dark:text-white text-black text-20 md:text-40>
        <div i-carbon-book>
        </div>
        <p>
          Markdown Preview
        </p>
      </div>
    </div>
    <div flex-auto w-full gap-40 flex-col overflow-hidden md:flex-row>
      <div class="h-1/2 w-full md:w-1/2 md:h-full" flex-col>
        <div text-size-20 md:text-size-30 text-orange-400 dark:text-orange-100 f-c-c gap-10>
          <div i-carbon-pen-fountain />
          Markdown
        </div>
        <div w-full h-full flex mt-10>
          <textarea overflow-auto w-full h-full max-h-screen text-20 mx-20 p-10 border-dashed border-2
            class="bg-red-200/25 dark:bg-cyan-950/25 hover:bg-red-200/50 dark:hover:bg-cyan-950/50"
            v-model="textContent"></textarea>
        </div>
      </div>
      <div class="h-1/2 w-full md:w-1/2 md:h-full" flex-col>
        <div text-size-20 md:text-size-30 text-orange-400 dark:text-orange-100 f-c-c gap-10>
          <div i-carbon-content-view />
          Preview
        </div>
        <div w-full h-full flex mt-10>
          <div w-full text-20 mx-20 h-full max-h-screen border-dashed border-2
            class="bg-red-200/25 dark:bg-cyan-950/25 hover:bg-red-200/50 dark:hover:bg-cyan-950/50">
            <vue-markdown w-full h-full overflow-auto text-left p-10 :source="renderText" :options="options"
              id="preview" />
          </div>
        </div>
      </div>
    </div>
    <div h-xs md:h-2xl f-c-c overflow-auto text-20 md:text-40>
      <a icon-btn i-carbon-logo-github text-30 md:text-40 href="https://github.com/yongruifang/ts-MdEditor" />
      <!-- <div text-20 h-full mx-40 mt-20 px-20 class="bg-red-200/25 dark:bg-cyan-950/25" v-text="renderText">
      </div> -->
    </div>
  </main>
</template>
<style>
#preview {
  h1 {
    font-size: 10rem;
    font-weight: 600;
    margin: 1.5rem 0;
  }

  h2 {
    font-size: 8.5rem;
    font-weight: 600;
    margin: 1.5rem 0;
  }

  h3 {
    font-size: 7rem;
    font-weight: 600;
    margin: 1.5rem 0;
  }

  h4 {
    font-size: 5.5rem;
    font-weight: 600;
    margin: 1.5rem 0;
  }

  blockquote {
    background: #f9f9f9;
    border-left: 10px solid #ccc;
    margin: 1.5em 10px;
    padding: 0.5em 10px;
    quotes: "\201C" "\201D" "\2018" "\2019";
  }

  blockquote:before {
    color: #ccc;
    content: open-quote;
    font-size: 4em;
    line-height: 0.1em;
    margin-right: 0.25em;
    vertical-align: -0.4em;
  }

  blockquote p {
    display: inline;
    color: #666;
  }

  hr {
    border: 1px solid #18181c;
  }
}

html.dark {
  #preview {
    hr {
      border: 1px solid white;
    }
  }
}
</style>