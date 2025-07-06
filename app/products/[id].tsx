import { useDatabase } from "@/context/DatabaseContext";
import { Product } from "@/db/schema";
import { base64ToDataUri, UriToBase64 } from "@/lib/utils";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Checkbox } from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { updateProduct, getProduct } = useDatabase();

  const [product, setProduct] = useState<Product | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  function handleProduct() {
    if (product!.title === "") {
      Alert.alert("Info", "Le produit doit avoir une désignation");
      return;
    }
    Alert.alert(
      "Confirmez les modifications",
      "Etes-vous sûr de vouloir procéder à cette action ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: () => {
            updateProduct(product!);
            Toast.show({
              type: "success",
              text1: "Produit mis à jour avec succès",
            });
            router.navigate("/");
          },
          style: "default",
        },
      ],
      { cancelable: true }
    );
  }

  async function getProductData() {
    const productData = await getProduct(Number(id));
    setProduct(productData);
  }

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    setProduct({ ...product!, barcode: data });
    setScanned(false);
    setModalVisible(false);
  };

  useEffect(() => {
    getProductData();
  }, []);

  if (!product) {
    return (
      <View className="items-center justify-center flex-1 px-4 bg-zinc-50">
        <Text>Chargement des données du produit</Text>
      </View>
    );
  }

  const pickAndSaveImage = async (): Promise<void> => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert("Une autorisation d'accès à la médiathèque est requise!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Reduce quality to keep base64 size manageable
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const { base64, mimeType } = await UriToBase64(asset.uri);

        setProduct({ ...product, base64Data: base64, mimeType });
      }
    } catch (error) {
      console.error("Error picking and saving image:", error);
      throw error;
    }
  };
  return (
    <View className="flex-1 px-4 bg-zinc-50">
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
      <View className="flex flex-row items-center justify-between pt-12 pb-3 bg-white">
        <Text className="text-xl font-bold">Modifier un produit</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={18} />
        </TouchableOpacity>
      </View>
      <ScrollView className="mb-16">
        <View className="gap-8 pt-6">
          <View className="gap-3">
            <Text className="font-medium">Image</Text>
            <View className="flex flex-row justify-center w-full">
              <View className="items-center justify-center w-64 h-64 overflow-hidden border border-gray-200 rounded-md">
                {product.base64Data && (
                  <Image
                    source={{
                      uri: base64ToDataUri(
                        product.base64Data,
                        product.mimeType!
                      ),
                    }}
                    className="w-64 h-64 rounded-md"
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => pickAndSaveImage()}
              className="w-full py-5 bg-teal-500"
            >
              <Text className="text-center text-white rounded-md">
                Choisissez une image
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            <Text className="font-medium">Référence</Text>
            <TextInput
              value={product!.ref!}
              onChangeText={(t) => setProduct({ ...product!, ref: t })}
              className="border border-gray-200 rounded-md"
            />
          </View>
          <View className="gap-3">
            <Text className="font-medium">Code à barres</Text>
            <View className="flex flex-row border border-gray-200 rounded-md">
              <TextInput
                value={product!.barcode!}
                onChangeText={(t) => setProduct({ ...product!, barcode: t })}
                className="flex-grow"
              />
              <TouchableOpacity
                className="items-center justify-center bg-teal-500 rounded-md w-14"
                onPress={() => setModalVisible(true)}
              >
                <CameraIcon size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="gap-3">
            <Text className="font-medium">Désignation</Text>
            <TextInput
              value={product!.title!}
              onChangeText={(t) => setProduct({ ...product!, title: t })}
              className="border border-gray-200 rounded-md"
            />
          </View>
          <View className="gap-3">
            <Text className="font-medium">Prix Détail</Text>
            <TextInput
              value={String(product!.detailPrice!)}
              onChangeText={(t) =>
                setProduct({ ...product!, detailPrice: Number(t) })
              }
              keyboardType="decimal-pad"
              className="border border-gray-200 rounded-md"
            />
          </View>
          <View className="gap-3">
            <Text className="font-medium">Prix Gros</Text>
            <TextInput
              value={String(product!.wholesalePrice!)}
              onChangeText={(t) =>
                setProduct({ ...product!, wholesalePrice: Number(t) })
              }
              keyboardType="decimal-pad"
              className="border border-gray-200 rounded-md"
            />
          </View>
          <View className="gap-3">
            <Text className="font-medium">Prix Demi-gros</Text>
            <TextInput
              value={String(product!.semiWSPrice!)}
              onChangeText={(t) =>
                setProduct({ ...product!, semiWSPrice: Number(t) })
              }
              keyboardType="decimal-pad"
              className="border border-gray-200 rounded-md"
            />
          </View>
          <View className="gap-3">
            <Text className="font-medium">Stock</Text>
            <TextInput
              value={String(product!.stock!)}
              onChangeText={(t) =>
                setProduct({ ...product!, stock: Number(t) })
              }
              keyboardType="decimal-pad"
              className="border border-gray-200 rounded-md"
            />
            <TouchableOpacity
              onPress={() => {
                if (product.isFollowStock) {
                  setProduct({
                    ...product!,
                    isFollowStock: false,
                  });
                } else {
                  setProduct({
                    ...product!,
                    isFollowStock: true,
                  });
                }
              }}
              className="flex flex-row items-start gap-3"
            >
              <Checkbox
                value={product!.isFollowStock!}
                color={product!.isFollowStock ? "#00bba7" : undefined}
              />
              <Text>Suivre le stock</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleProduct}
              className="flex items-center py-5 bg-teal-500 rounded-md"
            >
              <Text className="font-medium text-white">Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex items-center py-2 rounded-md bg-slate-500"
            >
              <Text className="font-medium text-white">Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
