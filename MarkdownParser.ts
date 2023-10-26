class HtmlHandler {
    public TextChangeHandler(id: string, output: string): void {
        let markdownSource = <HTMLTextAreaElement>document.getElementById(id);
        let htmlOutput = <HTMLLabelElement>document.getElementById(output);
        if (markdownSource !== null) {
            markdownSource.onkeyup = (e) => {
                console.debug(e, markdownSource.value)
                if (markdownSource.value) {
                    htmlOutput.innerHTML = markdownSource.value;
                } else {
                    htmlOutput.innerHTML = "<p></p>";
                }
            }
        }
    }
}