class HtmlHandler {
    private markdownChange: Markdown = new Markdown;
    private RenderHtmlContent(markdownSource: HTMLTextAreaElement, htmlOutput: HTMLLabelElement) {
        if (markdownSource.value) {
            htmlOutput.innerHTML = this.markdownChange.ToHtml(markdownSource.value)
        } else {
            htmlOutput.innerHTML = "<p></p>";
        }
    }
    public TextChangeHandler(id: string, output: string): void {
        let markdownSource = <HTMLTextAreaElement>document.getElementById(id);
        let htmlOutput = <HTMLLabelElement>document.getElementById(output);
        if (markdownSource !== null) {
            markdownSource.onkeyup = (e) => {
                /*逻辑移动到RenderHtmlContent方法中*/
                this.RenderHtmlContent(markdownSource, htmlOutput);
            }
        }
    }
}

/**
 * 添加枚举，定义我们将提供给用户使用的标签
 */
enum TagType {
    Paragraph,
    Header1,
    Header2,
    Header3,
    HorizontalRule
}

/**
 * 创建一个类
 * 单一职责：处理映射
 */
class TagTypeToHtml {
    private readonly tagTypeMap: Map<TagType, string> = new Map<TagType, string>();
    constructor() {
        this.tagTypeMap.set(TagType.Paragraph, "p");
        this.tagTypeMap.set(TagType.Header1, "h1");
        this.tagTypeMap.set(TagType.Header2, "h2");
        this.tagTypeMap.set(TagType.Header3, "h3");
        this.tagTypeMap.set(TagType.HorizontalRule, "hr");
    }
    private getTag(tagType: TagType, openingTagPattern: string): string {
        let tag = this.tagTypeMap.get(tagType);
        if (tag !== null) {
            return `${openingTagPattern}${tag}>`
        } else {
            return `${openingTagPattern}p>`
        }
    }
    /**
     * 获取对应的HTML开标签
     * @param tagType 
     * @returns 开标签
     */
    public OpeningTag(tagType: TagType): string {
        return this.getTag(tagType, '<')
    }
    /**
     * 获取对应的HTML闭标签
     * @param tagType 
     * @returns 闭标签
     */
    public ClosingTag(tagType: TagType): string {
        return this.getTag(tagType, '</')
    }
}

/**
 * 需要为写出HTML内容单独准备方法
 */

interface IMarkdownDocument {
    Add(...content: string[]): void;
    Get(): string;
}

/**
 * 作为一个平台
 * 每行处理之后的...content交付给平台即可
 * 可能情况 [str] or [<tag>,str,</tag>]
 */
class MarkdownDocument implements IMarkdownDocument {
    private content: string = "";
    public Add(...content: string[]): void {
        content.forEach((element) => {
            this.content += element;
        })
    }
    public Get(): string {
        return this.content;
    }
}

/**
 * 每次解析一行，使用一个类代表当前正在处理的行
 * 维护的一个属性就是当前行的内容
 */
class ParseElement {
    CurrentLine: string = "";
}

interface IVisitor {
    Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}
interface IVisitable {
    Accept(visitor: IVisitor, token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

abstract class VisitorBase implements IVisitor {
    constructor(private readonly tagType: TagType, private readonly TagTypeToHtml: TagTypeToHtml) {

    }
    Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void {
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
class Visitable implements IVisitable {
    Accept(visitor: IVisitor, token: ParseElement, markdownDocument: IMarkdownDocument): void {
        visitor.Visit(token, markdownDocument);
    }
}
/**
 * 责任链，将一系列类 连接起来
 * 创建的类 存储 类链中的下一个类
 */
abstract class Handler<T> { //作为类链中的一个单元类
    protected next: Handler<T> | null = null;
    public SetNext(next: Handler<T>): void {
        this.next = next;
    }
    protected abstract CanHandler(request: T): boolean;
    public HandleRequest(request: T): void {
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
    public Parse(value: string, tag: string): [boolean, string] {
        let output: [boolean, string] = [false, ""];
        output[1] = value;
        if (value === "") {
            return output;
        }
        let split = value.startsWith(`${tag}`)
        if (split) {
            output[0] = true;
            output[1] = value.substring(tag.length);
        }
        return output;
    }
}
class ParseChainHandler extends Handler<ParseElement> {
    private readonly visitable: IVisitable = new Visitable();
    constructor(private readonly document: IMarkdownDocument, private readonly tagType: string, private readonly visitor: IVisitor) {
        super()
    }
    protected CanHandler(request: ParseElement): boolean {
        let split = new LineParser().Parse(request.CurrentLine, this.tagType);
        if (split[0]) {
            request.CurrentLine = split[1]
            this.visitable.Accept(this.visitor, request, this.document);
        }
        return split[0];
    }
}
// 处理段落
class ParagraphHandler extends Handler<ParseElement> {
    private readonly visitable: IVisitable = new Visitable();
    private readonly visitor: IVisitor = new ParagraphVisitor()
    constructor(private readonly document: IMarkdownDocument) {
        super()
    }
    protected CanHandler(request: ParseElement): boolean {
        this.visitable.Accept(this.visitor, request, this.document);
        return true;
    }
}

/**
 * 为标签创建具体的处理程序
 */
class Header1ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "# ", new Header1Visitor());
    }
}
class Header2ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "## ", new Header2Visitor());
    }
}
class Header3ChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "### ", new Header3Visitor());
    }
}
class HorizontalRuleChainHandler extends ParseChainHandler {
    constructor(document: IMarkdownDocument) {
        super(document, "--- ", new HorizontalRuleVisitor());
    }
}
// 设置处理程序链
class ChainOfResponsibilityFactory {
    Build(document: IMarkdownDocument): ParseChainHandler {
        let header1: Header1ChainHandler = new Header1ChainHandler(document);
        let header2: Header2ChainHandler = new Header2ChainHandler(document);
        let header3: Header3ChainHandler = new Header3ChainHandler(document);
        let horizontalRule: HorizontalRuleChainHandler = new HorizontalRuleChainHandler(document);
        let paragraph: ParagraphHandler = new ParagraphHandler(document);
        header1.SetNext(header2);
        header2.SetNext(header3);
        header3.SetNext(horizontalRule);
        horizontalRule.SetNext(paragraph);
        return header1
    }
}

/**
 * 获取用户键入的文本，将其分隔成单独的行，创建ParseElement , 责任链处理程序， MarkdownDocument的实例
 */
class Markdown {
    public ToHtml(text: string): string {
        let document: IMarkdownDocument = new MarkdownDocument();
        let header1: Header1ChainHandler = new ChainOfResponsibilityFactory().Build(document);
        let lines: string[] = text.split("\n");
        lines.forEach((line) => {
            let token: ParseElement = new ParseElement();
            token.CurrentLine = line;
            header1.HandleRequest(token);
        })
        return document.Get();
    }
}