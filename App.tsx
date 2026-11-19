import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import { StoredSession } from "./src/types/tiktok";

import FilePickerScreen from "./src/screens/FilePickerScreen";
import OverviewScreen from "./src/screens/OverviewScreen";



type ScreenState =
	| { name: "picker" }
	| { name: "overview"; session: StoredSession };



export default function App()
{
	const [screen, setScreen] = useState<ScreenState>({ name: "picker" });

	return (
		<>
			<StatusBar style="dark"/>

			{screen.name === "picker" && (<FilePickerScreen onImported={(session) => setScreen({ name: "overview", session })}/>)}
			{screen.name === "overview" && (<OverviewScreen session={screen.session} onBack={() => setScreen({ name: "picker" })}/>)}
		</>
	);
}