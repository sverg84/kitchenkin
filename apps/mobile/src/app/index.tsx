import { useRecipes } from "@kk/graphql";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const { recipes, loading, error } = useRecipes();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Delicious Recipes
        </ThemedText>

        {loading && recipes.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ThemedText type="small">{error.message}</ThemedText>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={recipes}
            keyExtractor={(recipe) => recipe?.rawId ?? ""}
            renderItem={({ item }) =>
              item ? (
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="subtitle">{item.title}</ThemedText>
                  {item.description ? (
                    <ThemedText type="small" numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              ) : null
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
  },
  title: {
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
  list: {
    flex: 1,
    alignSelf: "stretch",
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  separator: {
    height: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
