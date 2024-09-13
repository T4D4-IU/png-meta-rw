import { writeFileSync } from "node:fs";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { console } from "node:inspector";

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
		const { fileToUpload } = formData as { fileToUpload: File };
		console.log(fileToUpload.name)

		// Write the to the static folder
		writeFileSync(
			`static/${fileToUpload.name}`,
			Buffer.from(await fileToUpload.arrayBuffer()),
		);

		return {
			success: true,
		};
	},
};
