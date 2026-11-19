import sampleData from "../../../__fixtures__/user_data_tiktok.sample.json";
import parseTikTokData from "../tiktokParser";

describe("parseTikTokData", () => {
	describe("valid fixture", () => {
		it("parses the sample fixture successfully", () => {
			const result = parseTikTokData(JSON.stringify(sampleData));
			expect(result.ok).toBe(true);
		});

		it("extracts exactly 6 collections", () => {
			const result = parseTikTokData(JSON.stringify(sampleData));
			if (!result.ok) throw new Error("fixture should parse");
			expect(result.data.collections).toHaveLength(6);
		});

		it("extracts exactly 7 videos", () => {
			const result = parseTikTokData(JSON.stringify(sampleData));
			if (!result.ok) throw new Error("fixture should parse");
			expect(result.data.videos).toHaveLength(7);
		});

		it("preserves collection names in original order", () => {
			const result = parseTikTokData(JSON.stringify(sampleData));
			if (!result.ok) throw new Error("fixture should parse");
			const names = result.data.collections.map((c) => c.FavoriteCollection);
			expect(names).toEqual([
				"Cooking",
				"Travel",
				"Music",
				"Workout",
				"Funny",
				"Coding",
			]);
		});

		it("preserves video URLs in original order", () => {
			const result = parseTikTokData(JSON.stringify(sampleData));
			if (!result.ok) throw new Error("fixture should parse");
			const links = result.data.videos.map((v) => v.Link);
			expect(links[0]).toContain("@user1");
			expect(links[6]).toContain("@user7");
		});
	});

	describe("INVALID_JSON", () => {
		it("rejects non-JSON text", () => {
			const result = parseTikTokData("this is not json");
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("INVALID_JSON");
			expect(result.message).toBe("Invalid JSON file");
		});

		it("rejects empty string", () => {
			const result = parseTikTokData("");
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("INVALID_JSON");
		});
	});

	describe("MISSING_SECTIONS", () => {
		it("rejects valid JSON without Likes and Favorites", () => {
			const result = parseTikTokData(JSON.stringify({ foo: 1 }));
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("MISSING_SECTIONS");
			expect(result.message).toBe("Missing required sections");
		});

		it("rejects missing FavoriteVideoList", () => {
			const bad = {
				"Likes and Favorites": {
					"Favorite Collection": { FavoriteCollectionList: [] },
				},
			};
			const result = parseTikTokData(JSON.stringify(bad));
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("MISSING_SECTIONS");
		});

		it("rejects non-array FavoriteCollectionList", () => {
			const bad = {
				"Likes and Favorites": {
					"Favorite Collection": { FavoriteCollectionList: "oops" },
					"Favorite Videos": { FavoriteVideoList: [] },
				},
			};
			const result = parseTikTokData(JSON.stringify(bad));
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("MISSING_SECTIONS");
		});
	});

	describe("EMPTY_COLLECTIONS", () => {
		it("rejects empty FavoriteCollectionList", () => {
			const bad = {
				"Likes and Favorites": {
					"Favorite Collection": { FavoriteCollectionList: [] },
					"Favorite Videos": { FavoriteVideoList: [] },
				},
			};
			const result = parseTikTokData(JSON.stringify(bad));
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe("EMPTY_COLLECTIONS");
			expect(result.message).toBe("Empty collection list");
		});
	});
});