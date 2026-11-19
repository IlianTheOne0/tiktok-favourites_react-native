import React, { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import { StoredSession } from "../types/tiktok";

import parseTikTokData  from "../services/tiktokParser";
import { hashFileContent } from "../services/hash";
import { clearAllSessions, createSession, getSession, listSessionHashes, saveSession, } from "../services/storage";

import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

import sampleData from "../../__fixtures__/user_data_tiktok.sample.json";



interface Props
{
	onImported: (session: StoredSession) => void;
}



const styles = StyleSheet.create
(
	{
		container:
		{
			flex: 1,
		
			backgroundColor: "#fff" 
		},
		content:
		{
			paddingHorizontal: 24,
		
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},

		title:
		{
			marginBottom: 8,
		
			fontSize: 22,
			fontWeight: "700",
			textAlign: "center",
		},
		subtitle:
		{
			marginBottom: 32,
		
			color: "#666",
		
			fontSize: 16,
		},

		button:
		{
			minWidth: 260,
		
			paddingVertical: 14,
			paddingHorizontal: 24,
		
			alignItems: "center",
		
			backgroundColor: "#007AFF",
		
			borderRadius: 10,
		},
		buttonText:
		{
			color: "#fff",

			fontSize: 16,
			fontWeight: "600"
		},
		
		secondaryButton:
		{
			marginTop: 16,
		
			paddingVertical: 10,
			paddingHorizontal: 20,
		
			borderRadius: 8,
			borderWidth: 1,
			borderColor: "#007AFF",
		},
		secondaryButtonText:
		{
			color: "#007AFF",
		
			fontSize: 14,
			fontWeight: "500",
		},

		error:
		{
			marginTop: 20,
		
			textAlign: "center",
		
			color: "#dc3545",
		
			fontSize: 15,
		},

		footer:
		{
			paddingVertical: 16,
		
			alignItems: "center",
		},
		footerLink:
		{
			fontSize: 13,
		
			color: "#007AFF",
		},
	}
);



function FilePickerScreen({ onImported }: Props)
{
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sessionCount, setSessionCount] = useState(0);

	const refreshSessionCount = async () =>
	{
		try
		{
			const hashes = await listSessionHashes();
			setSessionCount(hashes.length);
		}
		catch { setSessionCount(0); }
	};

	useEffect(() => { refreshSessionCount(); }, []);

	const pickFile = async () =>
	{
		setError(null);
		setLoading(true);
	
		try
		{
			const result = await DocumentPicker.getDocumentAsync
			(
				{
					type: ["application/json", "public.json", "text/plain"],
					copyToCacheDirectory: true,
					multiple: false,
				}
			);
			if (result.canceled) { return; }

			const asset = result.assets?.[0];
			if (!asset) { setError("No file selected"); return; }

			const raw = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8, });

			const hash = await hashFileContent(raw);
			const existing = await getSession(hash);

			if (existing) { await promptRestoreOrFresh(existing, raw); return; }

			await createFreshSession(hash, raw);
		}
		catch (error)
		{
			console.warn("File import failed:", error);
			setError("Failed to read the selected file");
		}
		finally { setLoading(false); }
	};

	const createFreshSession = async (hash: string, raw: string) =>
	{
		const parsed = parseTikTokData(raw);
		if (!parsed.ok) { setError(parsed.message); return; }

		const session = createSession(hash, parsed.data);
		
		await saveSession(session);
		await refreshSessionCount();
		
		onImported(session);
	};

	const promptRestoreOrFresh = async (existing: StoredSession, raw: string) =>
	{
		const imported = new Date(existing.importedAt).toLocaleString();
		const modified = new Date(existing.lastModifiedAt).toLocaleString();

		Alert.alert
		(
			"Saved progress found",
			`This file was imported before.\n\nImported: ${imported}\nLast modified: ${modified}\n\nLoad your saved progress or start fresh?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Start fresh",
					style: "destructive",
					onPress: async () => { await createFreshSession(existing.fileHash, raw); },
				},
				{
					text: "Continue",
					onPress: () => onImported(existing),
				},
			]
		);
	};

	const clearSavedData = () =>
	{
		if (sessionCount === 0)
		{
			Alert.alert("No saved data", "There are no saved sessions to clear.");
			return;
		}
		
		Alert.alert
		(
			"Clear saved data",
			`This will remove ${sessionCount} saved session(s). Continue?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: async () =>
					{
						await clearAllSessions();
						await refreshSessionCount();
					},
				},
			]
		);
	};



	const loadSampleData = async () =>
	{
		setError(null);
		setLoading(true);

		try
		{
			const raw = JSON.stringify(sampleData);
			const hash = await hashFileContent(raw);
			const existing = await getSession(hash);

			if (existing) { await promptRestoreOrFresh(existing, raw); return; }
			await createFreshSession(hash, raw);
		}
		catch (error)
		{
			console.warn("Sample load failed:", error);
			setError("Failed to load sample data");
		}
		finally { setLoading(false); }
	};



	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>TikTok Collections Manager</Text>
				<Text style={styles.subtitle}>Choose TikTok data file</Text>

				<TouchableOpacity style={styles.button} onPress={pickFile} disabled={loading}>
					{
						loading ?
						(<ActivityIndicator color="#fff"/>)
						:
						(<Text style={styles.buttonText}>Import user_data_tiktok.json</Text>)
					}
				</TouchableOpacity>
				{
					__DEV__ &&
					(
						<TouchableOpacity style={styles.secondaryButton} onPress={loadSampleData} disabled={loading}>
							<Text style={styles.secondaryButtonText}>Load sample data (dev only)</Text>
						</TouchableOpacity>
					)
				}

				{error && <Text style={styles.error}>{error}</Text>}
			</View>

			<View style={styles.footer}>
				<TouchableOpacity onPress={clearSavedData}>
					<Text style={styles.footerLink}>
						Clear saved data ({sessionCount})
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}



export default FilePickerScreen;