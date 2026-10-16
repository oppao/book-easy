import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Replace with your own ACTIVE n8n production webhook URL.
const WEBHOOK_URL =
  "https://scaleupagency.app.n8n.cloud/webhook/bookeasy-booking";
const SERVICES = ["Consultation", "Haircut", "Cleaning"];
const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function submit() {
    if (
      !name.trim() ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      Alert.alert(
        "Check details",
        "Enter your name, valid email, and date as YYYY-MM-DD.",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          service,
          date,
          time,
        }),
      });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          "Server returned non-JSON response. Check n8n Respond to Webhook node.",
        );
      }
      if (!response.ok || !data.success)
        throw new Error(data.message || `Request failed (${response.status})`);
      setResult(data);
    } catch (error) {
      Alert.alert(
        "Booking not submitted",
        error.message || "Check your connection and n8n workflow.",
      );
    } finally {
      setLoading(false);
    }
  }

  const choice = (items, selected, setSelected) => (
    <View style={styles.choices}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => setSelected(item)}
          style={[styles.chip, selected === item && styles.selected]}
        >
          <Text
            style={[styles.chipText, selected === item && styles.selectedText]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>BookEasy</Text>
        <Text style={styles.title}>Book an appointment</Text>
        <Text style={styles.subtitle}>
          Submit your request in under a minute.
        </Text>
        {result ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>Request received!</Text>
            <Text>Reference: {result.bookingId}</Text>
            <Text>Status: {result.status}</Text>
            <Text>Your appointment is not confirmed yet.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setResult(null)}
            >
              <Text style={styles.buttonText}>New request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Juan Dela Cruz"
              autoCapitalize="words"
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="juan@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Service</Text>
            {choice(SERVICES, service, setService)}
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-10-28"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.label}>Time (Philippine time)</Text>
            {choice(TIMES, time, setTime)}
            <TouchableOpacity
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={submit}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Submit booking request</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 24, paddingBottom: 50 },
  brand: {
    color: "#4f46e5",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { color: "#6b7280", marginTop: 6, marginBottom: 24 },
  label: {
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  selected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { color: "#334155" },
  selectedText: { color: "white" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 17,
    alignItems: "center",
    marginTop: 26,
  },
  buttonText: { color: "white", fontWeight: "800", fontSize: 16 },
  success: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 20,
    gap: 12,
    marginTop: 24,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#065f46" },
});
