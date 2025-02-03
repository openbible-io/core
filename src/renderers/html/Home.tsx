import type { Translation } from "../../i18n.ts";
import type { Author, Publication } from "../../index.ts";
import type { Version, Versions } from "../html.tsx";
import Ast from "./Ast.tsx";

interface Props extends Publication {
	translation: Translation;
	versions: Versions;
}

const Version = (
	{ id, version, translation }: {
		id: keyof Versions;
		version: Version;
		translation: Translation;
	},
) => {
	const prefix = id == "" ? "" : `/${id}`;

	return (
		<>
			<h2>{translation[id == "" ? "books" : id]}</h2>
			<table>
				<tbody>
					{Object.entries(version.bookChapters)
						.map(([bookId, { name, chapters }]) => (
							<tr>
								<td>
									<a href={`${prefix}/${bookId}`}>{name}</a>
								</td>
								<td>
									<ul class="flex flex-wrap gap-1">
										{chapters.map((i) => (
											<li>
												<a href={`${prefix}/${bookId}/${i}`}>{i}</a>
											</li>
										))}
									</ul>
								</td>
							</tr>
						))}
					<tr>
						<td>
							<a href={`${prefix}/all`}>{translation.all}</a>
						</td>
					</tr>
				</tbody>
			</table>
		</>
	);
};

export default (props: Props) => (
	<>
		<h1>{props.title}</h1>
		{Object.entries(props.versions).map(([id, version]) => (
			<Version
				id={id as keyof Versions}
				version={version}
				translation={props.translation}
			/>
		))}
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
