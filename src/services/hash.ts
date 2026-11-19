import * as Crypto from "expo-crypto";



async function hashFileContent(raw: string): Promise<string>
{
	return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
}



export { hashFileContent };