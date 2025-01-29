import type { Translation } from "../../../i18n.ts";
import type { Author, Publication } from "../../index.ts";
import Ast from "./Ast.tsx";

interface Props extends Publication {
	translation: Translation;
}

export default (props: Props) => (
	<>
		<h1>{props.title}</h1>
		<p>
			<table>
				<tr>
					<td>{props.translation.download}</td>
					<td>
						<a href={props.downloadUrl}>{props.downloadUrl}</a>
					</td>
				</tr>
				<tr>
					<td>{props.translation.publisher}</td>
					<td>
						<a href={props.publisherUrl}>{props.publisher}</a>
					</td>
				</tr>
				<tr>
					<td>{props.translation.publishDate}</td>
					<td>{props.publishDate}</td>
				</tr>
				{props.isbns &&
					Object.entries(props.isbns).map(([name, number]) => (
						<tr>
							<td>ISBN</td>
							<td>
								<a href={`https://isbnsearch.org/isbn/${number}`}>
									{name}
								</a>
							</td>
						</tr>
					))}
				<tr>
					<td>{props.translation.license}</td>
					<td>
						{"url" in props.license && (
							<a href={props.license.url}>{props.license.url}</a>
						)}
						{"spdx" in props.license && (
							<a href={`https://spdx.org/licenses/${props.license.spdx}`}>
								{props.license.spdx}
							</a>
						)}
						{"text" in props.license && props.license.text}
					</td>
				</tr>
			</table>
		</p>
		<h2>{props.translation.authors}</h2>
		<p>
			<ul>
				{(props.authors ?? []).map((a: Author) => (
					<li>
						{a.contributions?.join(", ")} <a href={a.url}>{a.name}</a>{" "}
						{a.qualifications?.join(", ")}
					</li>
				))}
			</ul>
		</p>
		{props.books.pre?.ast && (
			<>
				<h2>{props.translation.preface}</h2>
				<Ast ast={props.books.pre.ast} />
			</>
		)}
	</>
);
