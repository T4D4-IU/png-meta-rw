import { writeFileSync } from "node:fs";
import fs from "node:fs";
import { console } from "node:inspector";
import { error, fail } from "@sveltejs/kit";
// packages to use for read/write iTxt chunk
import { decodeSync, encodeSync } from "png-chunk-itxt";
import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import type { Actions, PageServerLoad } from "./$types";

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		if (
			!(formData.fileToUpload as File).name ||
			(formData.fileToUpload as File).name === "undefined"
		) {
			return fail(400, {
				error: true,
				message: "ファイルをアップロードしてください",
			});
		}
		const { fileToUpload, text } = formData as {
			fileToUpload: File;
			text: string;
		};

		// Write the to the static folder
		writeFileSync(
			`src/assets/${fileToUpload.name}`,
			Buffer.from(await fileToUpload.arrayBuffer()),
		);

		const buffer = fs.readFileSync(`src/assets/${fileToUpload.name}`);
		const chunks = extract(buffer);

		let embeddedText = "";
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
					text: text, // TODO フォームで入力した内容をココに入れる
				}),
			};
			// 最初のIDATチャンクの前にiTXtチャンクを挿入する。
			chunks.splice(
				chunks.findIndex((p) => p.name === "IDAT"),
				0,
				write_iTxtChunk,
			);

			const newFilePath = `src/assets/embedded_${fileToUpload.name}`;
			fs.writeFileSync(newFilePath, Buffer.from(encode(chunks)));

			return {
				success: true,
				embeddedText: text,
				downloadLink: `src/assets/embedded_${fileToUpload.name}`,
			};
		}
		// iTxt chunkから読み取る
		const read_iTxtChunk = chunks.find((c) => c.name === "iTXt");
		if (read_iTxtChunk !== undefined) {
			const iTxtData = decodeSync(read_iTxtChunk.data);
			embeddedText = iTxtData.text;
		} else {
			console.error("iTxtChunk is  undefined");
		}
		return {
			success: true,
			embeddedText: embeddedText,
		};
	},
};
