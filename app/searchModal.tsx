import { useDatabase } from "@/context/DatabaseContext";
import { useLocalStore } from "@/context/useLocalStore";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchModal() {
  const { searchProducts } = useDatabase();

  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");

  const setBarcode = useLocalStore((state) => state.setBarcode);

  const [value, setValue] = useState<string>("");

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="justify-center flex-1">
        <Text className="pb-6 text-center">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setScannedData(data);
    setValue(data);
    setBarcode(data);
    setScanned(false);
  };

  async function handleSearch() {
    if (value !== "") {
      await searchProducts(value);
      router.back();
    }
  }

  return (
    <View className="items-center flex-1 gap-4 px-6 py-16 bg-white">
      <View className="flex flex-row items-center justify-between w-full">
        <Text className="text-xl font-bold">Rechercher un produit</Text>
        <TouchableOpacity className="p-4" onPress={() => router.back()}>
          <X size={20} />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center w-full border border-gray-200 rounded-md">
        <TextInput
          className="flex-grow px-3"
          value={value}
          onChangeText={(txt) => setValue(txt)}
        />
        <TouchableOpacity
          onPress={handleSearch}
          className="p-4 bg-teal-500 rounded-md"
        >
          <Search size={18} color={"white"} />
        </TouchableOpacity>
      </View>
      <View className="relative w-full bg-red-500 rounded-md h-3/5">
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "pdf417",
              "aztec",
              "ean13",
              "ean8",
              "upc_e",
              "code128",
              "code39",
              "codabar",
            ],
          }}
          autofocus="on"
          className="flex-1 overflow-hidden rounded-md"
          facing="back"
        >
          <View className="w-full h-full overflow-hidden rounded-md"></View>
        </CameraView>
      </View>
      {scannedData && (
        <View>
          <Text>Dernière numérisation: {scannedData}</Text>
        </View>
      )}
    </View>
  );
}
