var HtmlHandler = /** @class */ (function () {
    function HtmlHandler() {
    }
    HtmlHandler.prototype.TextChangeHandler = function (id, output) {
        var markdownSource = document.getElementById(id);
        var htmlOutput = document.getElementById(output);
        if (markdownSource !== null) {
            markdownSource.onkeyup = function (e) {
                console.debug(e, markdownSource.value);
                if (markdownSource.value) {
                    htmlOutput.innerHTML = markdownSource.value;
                }
                else {
                    htmlOutput.innerHTML = "<p></p>";
                }
            };
        }
    };
    return HtmlHandler;
}());
