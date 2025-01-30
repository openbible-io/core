import type { ComponentChildren } from "preact";
import type { Publication } from "../../publication.ts";
import type { Translation } from "../../../i18n.ts";

export interface HtmlProps {
	pub: Publication;
	children: ComponentChildren;
	favicon: string;
	stylesheet: string;
	translation: Translation;
}
export default (props: HtmlProps) => (
	<html lang={props.pub.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1.0" />
			<title>{props.pub.id} - {props.pub.title}</title>
			<link rel="icon" href={props.favicon} />
			<link rel="stylesheet" href={props.stylesheet} />
		</head>
		<body>
			<nav>
				<a href="/">{props.translation.home}</a>
			</nav>
			{props.children}
		</body>
	</html>
);
