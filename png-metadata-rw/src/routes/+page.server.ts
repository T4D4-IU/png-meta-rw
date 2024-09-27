import { decodeSync, encodeSync } from "png-chunk-itxt";
import encode from "png-chunks-encode";
import extract from "png-chunks-extract";

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		if (
			!(formData.fileToUpload as File).name ||
			(formData.fileToUpload as File).name === "undefined"
		) {
			return {
				success: false,
				message: "ファイルが選択されていません",
			};
		}
		const { fileToUpload, text } = formData as {
			fileToUpload: File;
			text: string;
		};

		const chunks = extract(Buffer.from(await fileToUpload.arrayBuffer()));

		// フォームに入力されたテキストがある場合iTxtチャンクに書き込みをする
		if (text) {
			// iTxt chunkへ書きこむデータの整形
			const write_iTxtChunk = {
				name: "iTXt",
				data: encodeSync({
					keyword: "metadata",
					compressionFlag: false,
					compressionMethod: 0,
					languageTag: "",
					translatedKeyword: "",
					text: text,
				}),
			};
			// 最初のIDATチャンクの前にiTXtチャンクを挿入する。
			chunks.splice(
				chunks.findIndex((p) => p.name === "IDAT"),
				0,
				write_iTxtChunk,
			);

			return {
				success: true,
				message: "テキストの埋め込みに成功！",
				filename: `embedded_${fileToUpload.name}`,
				png: Buffer.from(encode(chunks)).toString("base64"),
			};
		}

		// iTxt chunkから読み取る
		let embeddedText = "";
		const read_iTxtChunk = chunks.find((c) => c.name === "iTXt");
		if (read_iTxtChunk !== undefined) {
			const iTxtData = decodeSync(read_iTxtChunk.data);
			embeddedText = iTxtData.text;
		} else {
			return {
				success: false,
				message: "iTxt chunkが見つかりませんでした",
			};
		}
		return {
			success: true,
			embeddedText: embeddedText,
		};
	},
};
