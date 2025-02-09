import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";
import {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
} from "../src/store/services/api";
import { router } from "expo-router";
import { Product } from "../src/store/types/product";

export default function HomeScreen() {
  const { data: products, isLoading: productsLoading } = useGetProductsQuery({
    limit: 20,
    page: 1,
  });
  const { data: product, isLoading: productLoading } =
    useGetProductByIdQuery(617);
  const { data: searchResults, isLoading: searchLoading } =
    useSearchProductsQuery({ q: "Zara", limit: 20, page: 1 });

  useEffect(() => {
    if (products) {
      console.log("Ürünler:", JSON.stringify(products, null, 2));
    }
    if (product) {
      console.log("Ürün Detayı:", JSON.stringify(product, null, 2));
    }
    if (searchResults) {
      console.log("Arama Sonuçları:", JSON.stringify(searchResults, null, 2));
    }
  }, [products, product, searchResults]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.images[0]?.filename }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <ThemedView style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.productPrice}>{item.price1} TL</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  if (productsLoading || productLoading || searchLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e91e63",
  },
});
