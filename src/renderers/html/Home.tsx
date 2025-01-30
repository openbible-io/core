import type { Translation } from "../../../i18n.ts";
import type { Author, Publication } from "../../index.ts";
import Ast from "./Ast.tsx";

interface Props extends Publication {
	translation: Translation;
	bookChapters: {
		[id: string]: {
			name: string;
			chapters: number[];
		};
	};
}

export default (props: Props) => (
	<>
		<h1>{props.title}</h1>
		<h2>{props.translation.books}</h2>
		<table>
			<tbody>
				{Object.entries(props.bookChapters)
					.filter(([id]) => id != "pre")
					.map(([id, { name, chapters }]) => (
						<tr>
							<td>
								<a href={`/${id}`}>{name}</a>
							</td>
							<td>
								<ul>
									{chapters.map((i) => (
										<li>
											<a href={`/${id}/${i}`}>{i}</a>
										</li>
									))}
								</ul>
							</td>
						</tr>
					))}
				<tr>
					<td>
						<a href="/all">{props.translation.all}</a>
					</td>
				</tr>
			</tbody>
		</table>
		<h2>{props.translation.details}</h2>
		<table>
			<tbody>
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
			</tbody>
		</table>
		<h2>{props.translation.authors}</h2>
		<ul class="mb-1">
			{(props.authors ?? []).map((a: Author) => (
				<li>
					{a.contributions?.join(", ")} <a href={a.url}>{a.name}</a>{" "}
					{a.qualifications?.join(", ")}
				</li>
			))}
		</ul>
		{props.books.pre?.data && (
			<>
				<h2>{props.translation.preface}</h2>
				<Ast ast={props.books.pre.data.ast} />
			</>
		)}
	</>
);
