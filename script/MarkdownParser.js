"use strict";
class HtmlHandler {
    TextChangeHandler(id, output) {
        let markdownSource = document.getElementById(id);
        let htmlOutput = document.getElementById(output);
        if (markdownSource !== null) {
            markdownSource.onkeyup = (e) => {
                console.debug(e, markdownSource.value);
                if (markdownSource.value) {
                    htmlOutput.innerHTML = markdownSource.value;
                }
                else {
                    htmlOutput.innerHTML = "<p></p>";
                }
            };
        }
    }
}
//# sourceMappingURL=MarkdownParser.js.map