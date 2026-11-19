import { TikTokData } from "../types/tiktok";



type ParseErrorCode = | "INVALID_JSON" | "MISSING_SECTIONS" | "EMPTY_COLLECTIONS";
type ParseResult = | { ok: true; data: TikTokData } | { ok: false; code: ParseErrorCode; message: string };



const ERROR_MESSAGES: Record<ParseErrorCode, string> =
{
	INVALID_JSON: "Invalid JSON file",
	MISSING_SECTIONS: "Missing required sections",
	EMPTY_COLLECTIONS: "Empty collection list",
};



const fail = (code: ParseErrorCode): ParseResult =>
(
	{
		ok: false,
		code,
		message: ERROR_MESSAGES[code],
	}
);



function parseTikTokData(raw: string): ParseResult
{
	let json: any;
	try { json = JSON.parse(raw); }
	catch { return fail("INVALID_JSON"); }

	const section = json?.["Likes and Favorites"];
	if (!section || typeof section !== "object") { return fail("MISSING_SECTIONS"); }

	const collections = section?.["Favorite Collection"]?.["FavoriteCollectionList"];
	const videos = section?.["Favorite Videos"]?.["FavoriteVideoList"];

	if (!Array.isArray(collections) || !Array.isArray(videos)) { return fail("MISSING_SECTIONS"); }
	if (collections.length === 0) { return fail("EMPTY_COLLECTIONS"); }

	return { ok: true, data: { collections, videos } };
}



export type { ParseErrorCode, ParseResult };

export default parseTikTokData;