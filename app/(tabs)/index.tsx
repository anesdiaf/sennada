import { useDatabase } from "@/context/DatabaseContext";
import { base64ToDataUri, formatToDZD } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { clsx } from "clsx";
import { Link } from "expo-router";
import { Banknote, RotateCcw, Search } from "lucide-react-native";
import {} from "nativewind";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { isDbReady, products, refreshData } = useDatabase();

  if (!isDbReady) {
    return (
      <View className="flex-1">
        <Text className="text-center">Loading database...</Text>
      </View>
    );
  }

  async function handleRefresh() {
    await refreshData();
  }

  return (
    <View className="flex-1 px-4 overflow-visible bg-zinc-50">
      <View className="flex flex-row items-center justify-between pt-12 pb-3 bg-white">
        <TouchableOpacity onPress={handleRefresh}>
          <View className="flex flex-row items-center gap-3">
            <Text className="text-xl font-bold">Liste des produits</Text>
            <RotateCcw size={20} />
          </View>
        </TouchableOpacity>

        <Link href={"/searchModal"}>
          <Search size={20} />
        </Link>
      </View>

      {products.length === 0 && (
        <View className="items-center justify-center flex-1">
          <Text className="text-center">La liste des produits est vide</Text>
        </View>
      )}

      {products.length !== 0 && (
        <FlashList
          data={products}
          estimatedItemSize={100}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: "/products/[id]",
                params: { id: item.id },
              }}
            >
              <View
                className="flex flex-row justify-between w-full my-2 overflow-hidden bg-white rounded-md"
                style={styles.shadow}
              >
                {item.base64Data ? (
                  <Image
                    className="w-20 h-20"
                    width={80}
                    height={80}
                    source={{
                      uri: base64ToDataUri(item.base64Data, item.mimeType!),
                    }}
                  />
                ) : (
                  <Image
                    className="w-20 h-20"
                    width={80}
                    height={80}
                    resizeMode="cover"
                    source={require("@/assets/images/placeholder.png")}
                  />
                )}

                <View className="flex-grow pt-2 pl-2">
                  <Text className="text-xl font-semibold">{item.title}</Text>
                  <View className="flex flex-row items-center justify-start w-full gap-3">
                    <View className="flex flex-row items-center justify-start gap-2">
                      <Banknote size={16} />
                      <Text>D:{formatToDZD(item.detailPrice || 0)}</Text>
                    </View>
                  </View>
                </View>
                <View
                  className={clsx(
                    "w-20 pt-2 pl-2 justify-center items-center",
                    item.isFollowStock ? "bg-teal-500" : "bg-slate-400"
                  )}
                >
                  <Text className="text-xl font-semibold text-white">
                    {item.stock}
                  </Text>
                </View>
              </View>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});
