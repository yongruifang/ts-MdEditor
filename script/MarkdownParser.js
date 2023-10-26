"use strict";
class HtmlHandler {
    constructor() {
        this.markdownChange = new Markdown;
    }
    RenderHtmlContent(markdownSource, htmlOutput) {
        if (markdownSource.value) {
            htmlOutput.innerHTML = this.markdownChange.ToHtml(markdownSource.value);
        }
        else {
            htmlOutput.innerHTML = "<p></p>";
        }
    }
    TextChangeHandler(id, output) {
        let markdownSource = document.getElementById(id);
        let htmlOutput = document.getElementById(output);
        if (markdownSource !== null) {
            markdownSource.onkeyup = (e) => {
                /*逻辑移动到RenderHtmlContent方法中*/
                this.RenderHtmlContent(markdownSource, htmlOutput);
                /*console.debug(e, markdownSource.value)
                if (markdownSource.value) {
                    htmlOutput.innerHTML = markdownSource.value;
                } else {
                    htmlOutput.innerHTML = "<p></p>";
                }*/
            };
            /*刷新页面丢失，解决方案*/
            window.onload = (e) => {
                console.log('onload', markdownSource);
                this.RenderHtmlContent(markdownSource, htmlOutput);
            };
        }
    }
}
/**
 * 添加枚举，定义我们将提供给用户使用的标签
 */
var TagType;
(function (TagType) {
    TagType[TagType["Paragraph"] = 0] = "Paragraph";
    TagType[TagType["Header1"] = 1] = "Header1";
    TagType[TagType["Header2"] = 2] = "Header2";
    TagType[TagType["Header3"] = 3] = "Header3";
    TagType[TagType["HorizontalRule"] = 4] = "HorizontalRule";
})(TagType || (TagType = {}));
/**
 * 创建一个类
 * 单一职责：处理映射
 */
class TagTypeToHtml {
    constructor() {
        this.tagTypeMap = new Map();
        this.tagTypeMap.set(TagType.Paragraph, "p");
        this.tagTypeMap.set(TagType.Header1, "h1");
        this.tagTypeMap.set(TagType.Header2, "h2");
        this.tagTypeMap.set(TagType.Header3, "h3");
        this.tagTypeMap.set(TagType.HorizontalRule, "hr");
    }
    getTag(tagType, openingTagPattern) {
        let tag = this.tagTypeMap.get(tagType);
        if (tag !== null) {
            return `${openingTagPattern}${tag}>`;
        }
        else {
            return `${openingTagPattern}p>`;
        }
    }
    /**
     * 获取对应的HTML开标签
     * @param tagType
     * @returns 开标签
     */
    OpeningTag(tagType) {
        return this.getTag(tagType, '<');
    }
    /**
     * 获取对应的HTML闭标签
     * @param tagType
     * @returns 闭标签
     */
    ClosingTag(tagType) {
        return this.getTag(tagType, '</');
    }
}
/**
 * 作为一个平台
 * 每行处理之后的...content交付给平台即可
 * 可能情况 [str] or [<tag>,str,</tag>]
 */
class MarkdownDocument {
    constructor() {
        this.content = "";
    }
    Add(...content) {
        content.forEach((element) => {
            this.content += element;
        });
    }
    Get() {
        return this.content;
    }
}
/**
 * 每次解析一行，使用一个类代表当前正在处理的行
 * 维护的一个属性就是当前行的内容
 */
class ParseElement {
    constructor() {
        this.CurrentLine = "";
    }
}
class VisitorBase {
    constructor(tagType, TagTypeToHtml) {
        this.tagType = tagType;
        this.TagTypeToHtml = TagTypeToHtml;
    }
    Visit(token, markdownDocument) {
        markdownDocument.Add(this.TagTypeToHtml.OpeningTag(this.tagType), token.CurrentLine, this.TagTypeToHtml.ClosingTag(this.tagType));
    }
}
/**
 * 添加具体的访问者实现
 * 单一职责：当前行放到对应标签中并添加到MarkdownDocument中
 */
class Header1Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header1, new TagTypeToHtml());
    }
}
class Header2Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header2, new TagTypeToHtml());
    }
}
class Header3Visitor extends VisitorBase {
    constructor() {
        super(TagType.Header3, new TagTypeToHtml());
    }
}
class ParagraphVisitor extends VisitorBase {
    constructor() {
        super(TagType.Paragraph, new TagTypeToHtml());
    }
}
class HorizontalRuleVisitor extends VisitorBase {
    constructor() {
        super(TagType.HorizontalRule, new TagTypeToHtml());
    }
}
/**
 * 访问者模式的另一端
 */
class Visitable {
    Accept(visitor, token, markdownDocument) {
        visitor.Visit(token, markdownDocument);
    }
}
/**
 * 责任链，将一系列类 连接起来
 * 创建的类 存储 类链中的下一个类
 */
class Handler {
    constructor() {
        this.next = null;
    }
    SetNext(next) {
        this.next = next;
    }
    HandleRequest(request) {
        if (!this.CanHandler(request)) { // 无法处理，将请求传递给下一个类
            if (this.next !== null) {
                this.next.HandleRequest(request);
            }
            return;
        }
    }
}
/**
 * 单一职责：解析字符串
 * 返回元组
 * boolean类型之处是否找到了标签
 * string类型返回tag之后的内容
 */
class LineParser {
    Parse(value, tag) {
        let output = [false, ""];
        output[1] = value;
        if (value === "") {
            return output;
        }
        let split = value.startsWith(`${tag}`);
        if (split) {
            output[0] = true;
            output[1] = value.substring(tag.length);
        }
        return output;
    }
}
class ParseChainHandler extends Handler {
    constructor(document, tagType, visitor) {
        super();
        this.document = document;
        this.tagType = tagType;
        this.visitor = visitor;
        this.visitable = new Visitable();
    }
    CanHandler(request) {
        let split = new LineParser().Parse(request.CurrentLine, this.tagType);
        if (split[0]) {
            request.CurrentLine = split[1];
            this.visitable.Accept(this.visitor, request, this.document);
        }
        return split[0];
    }
}
// 处理段落
class ParagraphHandler extends Handler {
    constructor(document) {
        super();
        this.document = document;
        this.visitable = new Visitable();
        this.visitor = new ParagraphVisitor();
    }
    CanHandler(request) {
        this.visitable.Accept(this.visitor, request, this.document);
        return true;
    }
}
/**
 * 为标签创建具体的处理程序
 */
class Header1ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "# ", new Header1Visitor());
    }
}
class Header2ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "## ", new Header2Visitor());
    }
}
class Header3ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "### ", new Header3Visitor());
    }
}
class HorizontalRuleChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "--- ", new HorizontalRuleVisitor());
    }
}
// 设置处理程序链
class ChainOfResponsibilityFactory {
    Build(document) {
        let header1 = new Header1ChainHandler(document);
        let header2 = new Header2ChainHandler(document);
        let header3 = new Header3ChainHandler(document);
        let horizontalRule = new HorizontalRuleChainHandler(document);
        let paragraph = new ParagraphHandler(document);
        header1.SetNext(header2);
        header2.SetNext(header3);
        header3.SetNext(horizontalRule);
        horizontalRule.SetNext(paragraph);
        return header1;
    }
}
/**
 * 获取用户键入的文本，将其分隔成单独的行，创建ParseElement , 责任链处理程序， MarkdownDocument的实例
 */
class Markdown {
    ToHtml(text) {
        let document = new MarkdownDocument();
        let header1 = new ChainOfResponsibilityFactory().Build(document);
        let lines = text.split("\n");
        lines.forEach((line) => {
            let token = new ParseElement();
            token.CurrentLine = line;
            header1.HandleRequest(token);
        });
        return document.Get();
    }
}
//# sourceMappingURL=MarkdownParser.js.map