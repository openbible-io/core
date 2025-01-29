export default (props: { chapter: number; nChapters: number }) => {
	const isFirst = props.chapter == 1;
	const isLast = props.chapter == props.nChapters;

	return (
		<nav class="chapterNav">
			<div>
				{!isFirst && <a href={`../${props.chapter - 1}`}>←</a>}
			</div>
			<div>
				{!isLast && <a href={`../${props.chapter + 1}`}>→</a>}
			</div>
		</nav>
	);
};
