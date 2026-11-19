import React, { useState } from "react";
import Constants from "expo-constants";

import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, } from "react-native";



const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

type BackendStatus = "idle" | "loading" | "alive" | "unreachable";



const styles = StyleSheet.create
(
	{
		container:
		{
			flex: 1,

			backgroundColor: "#fff",
		},
		content:
		{
			flex: 1,
			alignItems: "center",
			justifyContent: "center",

			paddingHorizontal: 24,
		},

		title:
		{
			marginBottom: 32,
		
			fontSize: 24,
			fontWeight: "700",
			textAlign: "center",
		},
		button:
		{
			minWidth: 200,
			
			paddingVertical: 14,
			paddingHorizontal: 32,
			
			alignItems: "center",

			backgroundColor: "#007AFF",
			
			borderRadius: 10,
		},
		buttonText:
		{
			color: "#fff",
		
			fontSize: 16,
			fontWeight: "600",
		},
		
		spinner:
		{
			marginTop: 16,
		},
		status:
		{
			marginTop: 16,

			fontSize: 16,
			fontWeight: "500",
		},
		success: { color: "#28a745", },
		error: { color: "#dc3545", },
	}
);



function App()
{
	const [status, setStatus] = useState<BackendStatus>("idle");

	const pingBackend = async () =>
	{
		setStatus("loading");

		try
		{
			const response = await fetch(`${API_URL}/health`);
			console.log(JSON.stringify(response));
			if (!response.ok) { throw new Error(`Unexpected status: ${response.status}`); }

			const data = await response.json();
			setStatus(data.status === "ok" ? "alive" : "unreachable");
		}
		catch (error)
		{
			console.warn("Backend ping failed:", error);
			setStatus("unreachable");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>TikTok Collections Manager</Text>

				<TouchableOpacity style={styles.button} onPress={pingBackend} disabled={status === "loading"}>
					<Text style={styles.buttonText}>{status === "loading" ? "Checking..." : "Ping backend"}</Text>
				</TouchableOpacity>

				{status === "loading" && (<ActivityIndicator size="small" color="#007AFF" style={styles.spinner} />)}
				{status === "alive" && (<Text style={[styles.status, styles.success]}>Backend is alive</Text>)}
				{status === "unreachable" && (<Text style={[styles.status, styles.error]}>Backend is unreachable</Text>)}
			</View>
		</SafeAreaView>
	);
}


export default App;