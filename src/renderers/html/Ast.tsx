import { type Ast, renderers } from "@openbible/bconv";

export default (props: { ast: Ast }) => {
	const html: string[] = [];
	const renderer = new renderers.Html((s) => html.push(s));
	renderer.visit(props.ast);

	return <main dangerouslySetInnerHTML={{ __html: html.join("") }} />;
}
