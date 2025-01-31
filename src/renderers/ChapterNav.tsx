export default (props: { chapter: number; chapters: number[] }) => {
	const isFirst = props.chapter == props.chapters[0];
	const isLast = props.chapter == props.chapters[props.chapters.length - 1];

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
