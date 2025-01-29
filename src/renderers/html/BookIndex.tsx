import type { Translation } from "../../../i18n.ts";
import type { Book } from "../../index.ts";

interface Props extends Book {
	translation: Translation;
}

export default (props: Props) => (
	<nav>
		<h1>{props.name}</h1>
		<ul>
			{[...Array(props.nChapters).keys()].map((i) => i + 1).map((i) => (
				<li>
					<a href={i.toString()}>{i}</a>
				</li>
			))}
			<li><a href="all">{props.translation.all}</a></li>
		</ul>
	</nav>
);
