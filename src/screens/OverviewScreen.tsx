import React from "react";

import { StoredSession } from "../types/tiktok";

import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";



interface Props
{
	session: StoredSession;

	onBack: () => void;
}



const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#e5e5e5",
	},
	backButton: { width: 80 },
	backText: { color: "#007AFF", fontSize: 16 },
	headerTitle: { fontSize: 17, fontWeight: "600" },
	content: { padding: 16 },
	metaBox: {
		backgroundColor: "#eef4ff",
		borderRadius: 10,
		padding: 12,
		marginBottom: 16,
	},
	metaLine: { fontSize: 13, color: "#333", marginVertical: 2 },
	metaLabel: { fontWeight: "600", color: "#555" },
	summaryRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	summaryCard: {
		flex: 1,
		backgroundColor: "#f2f2f7",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
	},
	summaryNumber: { fontSize: 28, fontWeight: "700", color: "#111" },
	summaryLabel: { fontSize: 13, color: "#666", marginTop: 2 },
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		marginTop: 8,
	},
	row: {
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#e5e5e5",
	},
	rowPrimary: { fontSize: 15, color: "#111" },
	rowSecondary: { fontSize: 12, color: "#888", marginTop: 2 },
	emptyText: { fontSize: 14, color: "#888", fontStyle: "italic" },
});



function OverviewScreen({ session, onBack }: Props)
{
	const { data, importedAt, lastModifiedAt } = session;
	const collections = data.collections.slice(0, 5);
	const videos = data.videos.slice(0, 5);

	const fmt = (iso: string) => new Date(iso).toLocaleString();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onBack} style={styles.backButton}>
					<Text style={styles.backText}>{"< Back"}</Text>
				</TouchableOpacity>

				<Text style={styles.headerTitle}>Overview</Text>
				<View style={styles.backButton}/>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.metaBox}>
					<Text style={styles.metaLine}>
						<Text style={styles.metaLabel}>Imported: </Text>
						{fmt(importedAt)}
					</Text>

					<Text style={styles.metaLine}>
						<Text style={styles.metaLabel}>Last modified: </Text>
						{fmt(lastModifiedAt)}
					</Text>
				</View>

				<View style={styles.summaryRow}>
					<View style={styles.summaryCard}>
						<Text style={styles.summaryNumber}>
							{data.collections.length}
						</Text>
						<Text style={styles.summaryLabel}>Collections</Text>
					</View>

					<View style={styles.summaryCard}>
						<Text style={styles.summaryNumber}>
							{data.videos.length}
						</Text>
						<Text style={styles.summaryLabel}>Videos</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>First 5 collections</Text>
				{
					collections.length === 0 ?
					(<Text style={styles.emptyText}>No collections found</Text>)
					:
					(
						collections.map
						(
							(column, index) =>
							(
								<View key={`col-${index}`} style={styles.row}>
									<Text style={styles.rowPrimary} numberOfLines={1}>
										{column.FavoriteCollection ?? "(unnamed)"}
									</Text>
									<Text style={styles.rowSecondary}>{column.Date}</Text>
								</View>
							)
						)
					)
				}

				<Text style={styles.sectionTitle}>First 5 videos</Text>
				{
					videos.length === 0 ?
					(<Text style={styles.emptyText}>No videos found</Text>)
					:
					(
						videos.map
						(
							(video, index) =>
							(
								<View key={`vid-${index}`} style={styles.row}>
									<Text style={styles.rowPrimary} numberOfLines={1}>
										{video.Link}
									</Text>
									<Text style={styles.rowSecondary}>{video.Date}</Text>
								</View>
							)
						)
					)
				}
			</ScrollView>
		</SafeAreaView>
	);
}



export default OverviewScreen;