import type { RequestHandler } from '@sveltejs/kit';
import extract from "png-chunks-extract";
import encode from "png-chunks-encode";
import { encodeSync, decodeSync } from 'png-chunk-itxt';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const received_text = formData.get('text');
	const received_file = formData.get('file');

	return new Response(
		JSON.stringify({
			message: 'データを受け取りました',
			text: received_text,
			file: received_file
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};