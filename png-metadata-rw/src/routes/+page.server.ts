// packages to use for read/write iTxt chunk
import { decodeSync, encodeSync } from "png-chunk-itxt";
import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import type { Actions, PageServerLoad } from "./$types";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv'

dotenv.config();

const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
	},
});

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

		const buffer = Buffer.from(await fileToUpload.arrayBuffer())
		const chunks = extract(buffer);

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
			// const newFilePath = `src/assets/embedded_${fileToUpload.name}`;
			// fs.writeFileSync(newFilePath, Buffer.from(encode(chunks)));

			// embeddedPngにエンコードしたchunksをBufferオブジェクトに変換し格納する
			const embeddedPng = Buffer.from(encode(chunks));
			// embeddedPngをCloudflareR2に保存する
			const filename = `embedded_${fileToUpload.name}_${Date.now()}`

			try {
				await s3Client.send(
					new PutObjectCommand({
						Bucket: process.env.R2_BUCKET_NAME,
						Key: filename,
						Body: embeddedPng,
						ContentType: 'image/png',
					})
				);

				return {
					success: true,
					message:  "画像を保存しました",
					filename: filename,
				};
			} catch (err) {
				return {
					success: false,
					message: "画像を保存できませんでした",
				}
			}
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
