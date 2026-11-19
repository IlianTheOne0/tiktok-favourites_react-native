import AsyncStorage from "@react-native-async-storage/async-storage";

import { SessionAnnotations, StoredSession, TikTokData, } from "../types/tiktok";



const INDEX_KEY = "@tcm:sessions:index";
const SESSION_KEY = (hash: string) => `@tcm:session:${hash}`;

const emptyAnnotations = (): SessionAnnotations =>
(
	{
		videoCollections: {},
		createdCollections: [],
	}
);



async function listSessionHashes(): Promise<string[]>
{
	const raw = await AsyncStorage.getItem(INDEX_KEY);
	return raw ? JSON.parse(raw) : [];
}

async function getSession(hash: string): Promise<StoredSession | null>
{
	const raw = await AsyncStorage.getItem(SESSION_KEY(hash));
	return raw ? (JSON.parse(raw) as StoredSession) : null;
}

async function saveSession(session: StoredSession): Promise<void> 
{
	await AsyncStorage.setItem(SESSION_KEY(session.fileHash), JSON.stringify(session));
	const index = await listSessionHashes();
	
	if (!index.includes(session.fileHash))
	{
		index.push(session.fileHash);
		await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
	}
}

async function updateSession(hash: string, updater: (session: StoredSession) => StoredSession): Promise<StoredSession | null>
{
	const existing = await getSession(hash);
	if (!existing) { return null; }

	const updated: StoredSession = {...updater(existing), lastModifiedAt: new Date().toISOString(), };
	await saveSession(updated);

	return updated;
}

async function deleteSession(hash: string): Promise<void>
{
	await AsyncStorage.removeItem(SESSION_KEY(hash));

	const index = await listSessionHashes();
	const filtered = index.filter((h) => h !== hash);

	await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(filtered));
}

async function clearAllSessions(): Promise<void>
{
	const index = await listSessionHashes();

	await AsyncStorage.multiRemove(index.map(SESSION_KEY));
	await AsyncStorage.removeItem(INDEX_KEY);
}

function createSession(fileHash: string, data: TikTokData ): StoredSession
{
	const now = new Date().toISOString();
	
	return {
		fileHash,
		importedAt: now,
		lastModifiedAt: now,
		data,
		annotations: emptyAnnotations(),
	};
}



export { listSessionHashes, getSession, saveSession, updateSession, deleteSession, clearAllSessions, createSession}