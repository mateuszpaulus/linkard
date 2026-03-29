import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { getPublicProfile, type ProfileResponse } from "../api";

type Props = NativeStackScreenProps<RootStackParamList, "PublicProfile">;

export default function PublicProfileScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `@${username}` });
    getPublicProfile(username)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (notFound || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notFoundEmoji}>🔍</Text>
        <Text style={styles.notFoundTitle}>Profil nie istnieje</Text>
        <Text style={styles.notFoundSub}>
          Sprawdź czy adres jest poprawny
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Wróć</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initials = profile.displayName
    ? profile.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : profile.username.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Header ── */}
        <View style={styles.hero}>
          {profile.avatarUrl
            ? <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{initials}</Text></View>
          }
          <Text style={styles.displayName}>{profile.displayName ?? profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          <View style={styles.metaRow}>
            {profile.location ? <Text style={styles.meta}>📍 {profile.location}</Text> : null}
            {profile.websiteUrl
              ? <TouchableOpacity onPress={() => Linking.openURL(profile.websiteUrl!)}>
                  <Text style={[styles.meta, styles.metaLink]}>
                    🔗 {profile.websiteUrl.replace(/^https?:\/\//, "")}
                  </Text>
                </TouchableOpacity>
              : null
            }
          </View>
        </View>

        {/* ── Usługi ── */}
        {profile.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CO OFERUJĘ</Text>
            {profile.services.map((s) => (
              <View key={s.id} style={styles.serviceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>{s.title}</Text>
                  {s.description ? <Text style={styles.serviceDesc}>{s.description}</Text> : null}
                </View>
                {s.price != null && (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{s.price} {s.currency}</Text>
                    {s.priceLabel ? <Text style={styles.priceLabel}>{s.priceLabel}</Text> : null}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Linki ── */}
        {profile.links.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ZNAJDŹ MNIE</Text>
            {profile.links.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={styles.linkCard}
                onPress={() => Linking.openURL(l.url)}
              >
                <View style={styles.linkIcon}>
                  <Text style={styles.linkIconText}>{(l.iconName ?? l.label).slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.linkLabel}>{l.label}</Text>
                <Text style={styles.linkArrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Kontakt ── */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL(`mailto:?subject=Cześć ${profile.displayName ?? profile.username}!`)}
        >
          <Text style={styles.contactButtonText}>Skontaktuj się</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 24 },
  scroll: { padding: 20, gap: 24 },
  notFoundEmoji: { fontSize: 48 },
  notFoundTitle: { fontSize: 22, fontWeight: "700", color: "#18181b" },
  notFoundSub: { fontSize: 14, color: "#71717a", textAlign: "center" },
  backButton: { marginTop: 8, backgroundColor: "#3B82F6", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  backButtonText: { color: "#fff", fontWeight: "600" },
  hero: { alignItems: "center", gap: 6 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 4 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#3B82F6",
    justifyContent: "center", alignItems: "center", marginBottom: 4,
  },
  avatarInitials: { color: "#fff", fontSize: 30, fontWeight: "700" },
  displayName: { fontSize: 24, fontWeight: "700", color: "#18181b" },
  username: { fontSize: 14, color: "#71717a" },
  bio: { fontSize: 14, color: "#52525b", textAlign: "center", lineHeight: 20, maxWidth: 280 },
  metaRow: { flexDirection: "row", gap: 16, flexWrap: "wrap", justifyContent: "center" },
  meta: { fontSize: 13, color: "#a1a1aa" },
  metaLink: { color: "#3B82F6" },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#a1a1aa", letterSpacing: 1.5, textAlign: "center" },
  serviceCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#e4e4e7",
    padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
  },
  serviceTitle: { fontSize: 15, fontWeight: "600", color: "#18181b" },
  serviceDesc: { fontSize: 13, color: "#71717a", marginTop: 2 },
  priceBadge: { backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: "flex-end" },
  priceText: { fontSize: 15, fontWeight: "700", color: "#3B82F6" },
  priceLabel: { fontSize: 11, color: "#93c5fd", marginTop: 1 },
  linkCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#e4e4e7",
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  linkIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f4f4f5", justifyContent: "center", alignItems: "center" },
  linkIconText: { fontSize: 11, fontWeight: "700", color: "#52525b" },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#18181b" },
  linkArrow: { fontSize: 16, color: "#a1a1aa" },
  contactButton: {
    backgroundColor: "#18181b", borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
  },
  contactButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
