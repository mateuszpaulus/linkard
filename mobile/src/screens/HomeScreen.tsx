import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.logo}>Skedify</Text>
          <Text style={styles.headline}>
            Twój profesjonalny profil{"\n"}w 5 minut
          </Text>
          <Text style={styles.subheadline}>
            Jedna strona. Wszystkie usługi. Jeden link.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.primaryButtonText}>Zacznij za darmo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.secondaryButtonText}>Zaloguj się</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.steps}>
          {[
            { icon: "👤", title: "Zarejestruj się", desc: "Konto w 30 sekund" },
            { icon: "✏️", title: "Wypełnij profil", desc: "Bio, usługi, linki" },
            { icon: "🔗", title: "Udostępnij link", desc: "skedify-io.vercel.app/ty" },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          skedify-io.vercel.app/twojnazwa
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24, gap: 40 },
  hero: { alignItems: "center", gap: 12, paddingTop: 32 },
  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: "#18181b",
    letterSpacing: -1,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: "#18181b",
    textAlign: "center",
    lineHeight: 36,
  },
  subheadline: {
    fontSize: 16,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: { gap: 12 },
  primaryButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#e4e4e7",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#18181b", fontSize: 16, fontWeight: "500" },
  steps: { flexDirection: "row", gap: 8 },
  step: { flex: 1, alignItems: "center", gap: 6 },
  stepIcon: { fontSize: 28 },
  stepTitle: { fontSize: 13, fontWeight: "600", color: "#18181b", textAlign: "center" },
  stepDesc: { fontSize: 11, color: "#a1a1aa", textAlign: "center" },
  footer: { textAlign: "center", color: "#a1a1aa", fontSize: 12, paddingBottom: 16 },
});
