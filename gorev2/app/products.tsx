import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/store/services/api";
import { Product } from "@/types/product";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";

const getProductImage = (productName: string) => {
  switch (productName) {
    case "Zara Sleeve T-Shirt":
      return require("../assets/images/zaratshirt.jpg");
    case "Nivea Nemlendirici":
      return require("../assets/images/niveanemlendirici.jpg");
    case "VESTEL Akıllı Saat":
      return require("../assets/images/vestelakıllısaat.jpg");
    case "PUMA Sneaker":
      return require("../assets/images/pumasnekader.jpeg");
    case "Apple iPhone 13":
      return require("../assets/images/iphone13.jpg");
    case "Zara Triko Kazak":
      return require("../assets/images/zaratrikokazak.jpg");
    default:
      return require("../assets/images/zaratshirt.jpg");
  }
};

export default function ProductsScreen() {
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDeleteProduct = async (id: number, name: string) => {
    Alert.alert(
      "Ürünü Sil",
      `"${name}" ürününü silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id).unwrap();
              Alert.alert("Başarılı", `"${name}" ürünü başarıyla silindi.`);
              refetch(); // Listeyi yenile
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert(
                "Hata",
                "Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin."
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={getProductImage(item.name)}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <ThemedText style={styles.productName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={styles.stockContainer}>
            <ThemedText
              style={[
                styles.stockText,
                { color: item.stockAmount > 0 ? "#059669" : "#dc2626" },
              ]}
            >
              {item.stockAmount > 0 ? "Stokta" : "Stok Yok"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.productDetails}>
          <ThemedText style={styles.productPrice}>
            {item.price1.toLocaleString("tr-TR")} {item.currency.label}
          </ThemedText>
          <ThemedText style={styles.productStock}>
            Stok: {item.stockAmount} {item.stockTypeLabel}
          </ThemedText>
        </View>

        <View style={styles.productMeta}>
          <ThemedText style={styles.productSku}>SKU: {item.sku}</ThemedText>
          {item.barcode && (
            <ThemedText style={styles.productBarcode}>
              Barkod: {item.barcode}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            isDeleting && styles.disabledButton,
          ]}
          onPress={() => handleDeleteProduct(item.id, item.name)}
          disabled={isDeleting}
        >
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={isDeleting ? "#9ca3af" : "#dc2626"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4338ca" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#dc2626" />
        <ThemedText style={styles.errorText}>
          Ürünler yüklenirken bir hata oluştu
        </ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <ThemedText style={styles.retryText}>Tekrar Dene</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Ürünler",
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/")}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#1e293b"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/add-product")}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="package-variant"
              size={64}
              color="#94a3b8"
            />
            <ThemedText style={styles.emptyText}>
              Henüz hiç ürün eklenmemiş
            </ThemedText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  stockContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
  },
  productDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4338ca",
  },
  productStock: {
    fontSize: 13,
    color: "#64748b",
  },
  productMeta: {
    flexDirection: "row",
    gap: 12,
  },
  productSku: {
    fontSize: 12,
    color: "#94a3b8",
  },
  productBarcode: {
    fontSize: 12,
    color: "#94a3b8",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  editButton: {
    borderColor: "#4338ca",
    backgroundColor: "#eef2ff",
  },
  deleteButton: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  addButton: {
    backgroundColor: "#4338ca",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4338ca",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  backButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: "#9ca3af",
    backgroundColor: "#f3f4f6",
  },
});
