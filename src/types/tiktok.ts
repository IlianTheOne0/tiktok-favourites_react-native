interface FavoriteCollection
{
	Date: string;
	FavoriteCollection: string;
}

interface FavoriteVideo
{
	Date: string;
	Link: string;
}

interface TikTokData
{
	collections: FavoriteCollection[];
	videos: FavoriteVideo[];
}



interface SessionAnnotations
{
	videoCollections: Record<string, string[]>;
	createdCollections: string[];
}

interface StoredSession
{
	fileHash: string;
	importedAt: string;
	lastModifiedAt: string;
	data: TikTokData;
	annotations: SessionAnnotations;
}



export type { FavoriteCollection, FavoriteVideo, TikTokData };
export type { SessionAnnotations, StoredSession };