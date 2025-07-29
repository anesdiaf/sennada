import { useServerStore } from "@/context/useServerStore";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { CameraIcon, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const protocol = "ws://";
const port = ":9000";

type Props = {};
function Connect({}: Props) {
  const { setLocalIp: saveLocalIp, localIp } = useServerStore((state) => state);

  const [url, setUrl] = useState(null); // Replace with your WPF machine's LAN IP
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [saleModalVisible, setSaleModalVisible] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const log = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  const connect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(protocol + url + port);

    wsRef.current.onopen = () => {
      if (url) {
        saveLocalIp(url);
      }
      log("✅ Connected to " + url);
      Toast.show({ type: "success", text1: "Application connectée au succès" });
    };

    wsRef.current.onmessage = (e) => {
      Toast.show({ type: "success", text1: "📥 Received: " + e.data });
    };

    wsRef.current.onerror = (e) => {
      Toast.show({ type: "error", text1: "❌ Error: " + e.message });
    };

    wsRef.current.onclose = () => {
      Toast.show({ type: "info", text1: "🔌 Disconnected" });
    };
  };

  const sendNewSale = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      Alert.alert("⚠️ WebSocket not connected");
      return;
    }

    const msg = { type: "newSale" };
    wsRef.current.send(JSON.stringify(msg));

    setSaleModalVisible(true);

    log("📤 Sent: " + JSON.stringify(msg));
  };

  const sendLock = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      Alert.alert("⚠️ L'application n'est pas connectée");
      return;
    }

    const msg = { type: "lockApp" };
    wsRef.current.send(JSON.stringify(msg));
    log("📤 Sent: " + JSON.stringify(msg));
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    setUrl(data);
    setScanned(false);
    setModalVisible(false);
  };

  const closeSale = () => {
    setSaleModalVisible(false);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      Alert.alert("⚠️ L'application n'est pas connectée");
      return;
    }
    const msg = { type: "cancelSale" };
    wsRef.current.send(JSON.stringify(msg));
    Toast.show({ type: "info", text1: "Vente annulée" });
  };

  useEffect(() => {
    if (localIp) {
      setUrl(localIp);
    }
  }, []);

  return (
    <View className="flex-1 px-4 bg-zinc-50">
      <View className="flex flex-row items-center justify-between pt-12 pb-3 bg-white">
        <Text className="text-xl font-bold">
          Connectez-vous à l&apos;application de bureau
        </Text>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <CameraView
            ratio="1:1"
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
            facing="back"
          >
            <View className="w-96 h-96">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="absolute p-4 bg-white rounded-md right-4"
              >
                <X size={18}></X>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={saleModalVisible}
        onRequestClose={() => setSaleModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <View className="z-40 w-4/5 bg-white rounded-md h-4/5">
            <TouchableOpacity
              className="absolute z-50 p-4 bg-red-500 rounded-md w-fit right-4 top-4"
              onPress={() => closeSale()}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View className="gap-3">
        <Text className="font-medium">Code à barres</Text>
        <View className="flex flex-row border border-gray-200 rounded-md">
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="ws://192.168.1.x:9000"
            className="flex-grow px-2 py-3"
          />
          <TouchableOpacity
            className="items-center justify-center bg-teal-500 rounded-md w-14"
            onPress={() => setModalVisible(true)}
          >
            <CameraIcon size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button title="Connect" onPress={connect} />
        <Button title="Nouvelle vente" onPress={sendNewSale} />
        <Button title="Verrouillage" onPress={sendLock} />
      </View>
      <ScrollView style={styles.log}>
        {messages.map((msg, index) => (
          <Text key={index} style={{ fontSize: 12 }}>
            {msg}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
export default Connect;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  log: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
  },
});
