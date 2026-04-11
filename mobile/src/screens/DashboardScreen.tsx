import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  getMyServices,
  addService,
  deleteService,
  getMyLinks,
  addLink,
  deleteLink,
  type ProfileResponse,
  type ServiceResponse,
  type LinkResponse,
} from "../api";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;
const BIO_MAX = 160;

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Other" },
];

type Tab = "profile" | "services" | "links";

export default function DashboardScreen({ navigation }: Props) {
  const { getToken, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    location: "",
    websiteUrl: "",
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkPlatform, setLinkPlatform] = useState("linkedin");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  async function loadData() {
    const token = await getToken();
    if (!token) return;
    try {
      const p = await getMyProfile(token);
      setProfile(p);
      setForm({
        username: p.username ?? "",
        displayName: p.displayName ?? "",
        bio: p.bio ?? "",
        location: p.location ?? "",
        websiteUrl: p.websiteUrl ?? "",
      });
      const [s, l] = await Promise.all([getMyServices(token), getMyLinks(token)]);
      setServices(s);
      setLinks(l);
    } catch {
      // no profile yet — new user
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!USERNAME_REGEX.test(form.username)) {
      Alert.alert("Invalid username", "3-30 characters: a-z, 0-9, hyphens");
      return;
    }
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    try {
      const saved = profile
        ? await updateProfile(token, form)
        : await createProfile(token, form);
      setProfile(saved);
      Alert.alert("✓ Saved", "Profile updated successfully");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddService() {
    if (!serviceTitle.trim()) return;
    const token = await getToken();
    if (!token) return;
    try {
      const s = await addService(token, {
        title: serviceTitle,
        price: servicePrice ? parseFloat(servicePrice) : undefined,
        currency: "PLN",
      });
      setServices((prev) => [...prev, s]);
      setServiceTitle("");
      setServicePrice("");
      setShowServiceForm(false);
    } catch {
      Alert.alert("Error", "Failed to add service");
    }
  }

  async function handleDeleteService(id: string) {
    Alert.alert("Delete service?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          if (!token) return;
          await deleteService(token, id);
          setServices((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  }

  async function handleAddLink() {
    if (!linkUrl.trim()) return;
    const token = await getToken();
    if (!token) return;
    try {
      const label = PLATFORMS.find((p) => p.value === linkPlatform)?.label ?? "Link";
      const l = await addLink(token, { label, url: linkUrl, iconName: linkPlatform });
      setLinks((prev) => [...prev, l]);
      setLinkUrl("");
      setShowLinkForm(false);
    } catch {
      Alert.alert("Error", "Failed to add link");
    }
  }

  async function handleDeleteLink(id: string) {
    const token = await getToken();
    if (!token) return;
    await deleteLink(token, id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleCopyLink() {
    if (!profile?.username) return;
    const url = `https://skedify-io.vercel.app/${profile.username}`;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    Alert.alert("Link copied!", url);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenProfile() {
    if (!profile?.username) return;
    Linking.openURL(`https://skedify-io.vercel.app/${profile.username}`);
  }

  const initials = form.displayName
    ? form.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : form.username.slice(0, 2).toUpperCase() || "?";

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Skedify</Text>
        <View style={styles.headerRight}>
          {profile && (
            <TouchableOpacity
              onPress={() => navigation.navigate("PublicProfile", { username: profile.username })}
            >
              <Text style={styles.headerLink}>Preview</Text>
            </TouchableOpacity>
          )}
          {profile?.username && (
            <TouchableOpacity onPress={handleCopyLink}>
              <Text style={styles.headerLink}>{copied ? "✓" : "Copy"}</Text>
            </TouchableOpacity>
          )}
          {profile?.username && (
            <TouchableOpacity onPress={handleOpenProfile}>
              <Text style={styles.headerLink}>Open ↗</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => signOut()}>
            <Text style={[styles.headerLink, { color: "#ef4444" }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["profile", "services", "links"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "profile" ? "👤 Profile" : tab === "services" ? "💼 Services" : "🔗 Links"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TAB: Profile ── */}
      {activeTab === "profile" && (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Avatar */}
          <View style={styles.avatarRow}>
            {profile?.avatarUrl
              ? <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{initials}</Text></View>
            }
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Your link</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.usernamePrefix}>skedify-io.vercel.app/</Text>
              <TextInput
                style={styles.usernameInput}
                placeholder="username"
                value={form.username}
                onChangeText={(v) => setForm((f) => ({ ...f, username: v.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Smith"
              value={form.displayName}
              onChangeText={(v) => setForm((f) => ({ ...f, displayName: v }))}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio</Text>
              <Text style={[styles.counter, form.bio.length > BIO_MAX && styles.counterOver]}>
                {form.bio.length}/{BIO_MAX}
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChangeText={(v) => setForm((f) => ({ ...f, bio: v.slice(0, BIO_MAX) }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Warsaw"
              value={form.location}
              onChangeText={(v) => setForm((f) => ({ ...f, location: v }))}
            />
          </View>

          <View style={styles.field}>
p            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="https://yourwebsite.com"
              value={form.websiteUrl}
              onChangeText={(v) => setForm((f) => ({ ...f, websiteUrl: v }))}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveButtonText}>Save profile</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── TAB: Services ── */}
      {activeTab === "services" && (
        <View style={{ flex: 1 }}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity onPress={() => setShowServiceForm(true)}>
              <Text style={styles.addBtn}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {showServiceForm && (
            <View style={styles.inlineForm}>
              <TextInput
                style={styles.input}
                placeholder="Service title *"
                value={serviceTitle}
                onChangeText={setServiceTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Price (e.g. 300)"
                value={servicePrice}
                onChangeText={setServicePrice}
                keyboardType="decimal-pad"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddService}>
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowServiceForm(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No services yet. Add your first one.</Text>}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  {item.price != null && (
                    <Text style={styles.priceText}>{item.price} {item.currency}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteService(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* ── TAB: Links ── */}
      {activeTab === "links" && (
        <View style={{ flex: 1 }}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Social links</Text>
            <TouchableOpacity onPress={() => setShowLinkForm(true)}>
              <Text style={styles.addBtn}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {showLinkForm && (
            <View style={styles.inlineForm}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PLATFORMS.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      style={[styles.platformChip, linkPlatform === p.value && styles.platformChipActive]}
                      onPress={() => setLinkPlatform(p.value)}
                    >
                      <Text style={[styles.platformChipText, linkPlatform === p.value && styles.platformChipTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                style={styles.input}
                placeholder="URL *"
                value={linkUrl}
                onChangeText={setLinkUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddLink}>
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLinkForm(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No links yet. Add your profiles.</Text>}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>{item.label}</Text>
                  <Text style={styles.listItemSub} numberOfLines={1}>{item.url}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLink(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  headerLogo: { fontSize: 18, fontWeight: "800", color: "#18181b" },
  headerRight: { flexDirection: "row", gap: 12 },
  headerLink: { fontSize: 13, color: "#3B82F6", fontWeight: "500" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#3B82F6" },
  tabText: { fontSize: 12, color: "#a1a1aa", fontWeight: "500" },
  tabTextActive: { color: "#3B82F6" },
  scroll: { padding: 16, gap: 4 },
  avatarRow: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#18181b",
    justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 26, fontWeight: "700" },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#52525b", marginBottom: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  counter: { fontSize: 11, color: "#a1a1aa" },
  counterOver: { color: "#ef4444" },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#18181b",
  },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  usernameRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 10, backgroundColor: "#fff", overflow: "hidden" },
  usernamePrefix: { paddingHorizontal: 10, paddingVertical: 11, fontSize: 13, color: "#a1a1aa", backgroundColor: "#f9fafb", borderRightWidth: 1, borderRightColor: "#e4e4e7" },
  usernameInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 11, fontSize: 14, color: "#18181b" },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  listHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f4f4f5",
  },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#18181b" },
  addBtn: { fontSize: 14, color: "#3B82F6", fontWeight: "600" },
  inlineForm: { padding: 16, backgroundColor: "#f9fafb", borderBottomWidth: 1, borderBottomColor: "#e4e4e7" },
  formButtons: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  cancelText: { fontSize: 14, color: "#71717a" },
  listContent: { padding: 12, gap: 8 },
  emptyText: { textAlign: "center", color: "#a1a1aa", fontSize: 13, marginTop: 32 },
  listItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#e4e4e7",
    paddingHorizontal: 14, paddingVertical: 12,
  },
  listItemTitle: { fontSize: 14, fontWeight: "600", color: "#18181b" },
  listItemSub: { fontSize: 12, color: "#a1a1aa", marginTop: 2 },
  priceText: { fontSize: 13, color: "#3B82F6", fontWeight: "600", marginTop: 2 },
  deleteText: { fontSize: 13, color: "#ef4444", marginLeft: 12 },
  platformChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#e4e4e7",
    backgroundColor: "#fff",
  },
  platformChipActive: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  platformChipText: { fontSize: 13, color: "#52525b" },
  platformChipTextActive: { color: "#fff", fontWeight: "600" },
});
