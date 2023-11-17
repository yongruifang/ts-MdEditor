import { createApp } from 'vue'
import '@unocss/reset/tailwind.css'
import './style.css'
import App from './App.vue'
import 'virtual:uno.css'

createApp(App).mount('#app')

const textarea = document.querySelector("textarea");
if (textarea === null) throw new Error("textarea not found")
textarea.addEventListener("keydown", (e) => {
    // 接受tab
    if (e.key === "Tab") {
        e.preventDefault();
        textarea.setRangeText(
            "  ",
            textarea.selectionStart,
            textarea.selectionStart,
            "end"
        );
    }
});
