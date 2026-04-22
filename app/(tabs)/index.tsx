import { Profanity } from "@2toad/profanity";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const filter = new Profanity();

type Severity = "none" | "mild" | "high";

export default function Index() {
  const [reflection, setReflection] = useState("");

  const analysis = useMemo(() => {
    const trimmed = reflection.trim();

    if (!trimmed) {
      return {
        hasProfanity: false,
        severity: "none" as Severity,
        statusText: "Start typing to test the classroom-safe filter.",
        cleanedText: "",
        canSubmit: false,
      };
    }

    const hasProfanity = filter.exists(trimmed);
    const cleanedText = hasProfanity ? filter.censor(trimmed) : trimmed;

    let severity: Severity = "none";
    let statusText = "This text is appropriate for submission.";

    if (hasProfanity) {
      const wordCount = trimmed.split(/\s+/).length;
      const censorCount = (cleanedText.match(/\*/g) || []).length;

      if (wordCount <= 6 && censorCount <= 6) {
        severity = "mild";
        statusText =
          "Mild inappropriate language detected. Please improve your wording.";
      } else {
        severity = "high";
        statusText =
          "Stronger inappropriate language detected. Please revise before submitting.";
      }
    }

    return {
      hasProfanity,
      severity,
      statusText,
      cleanedText,
      canSubmit: trimmed.length > 0 && !hasProfanity,
    };
  }, [reflection]);

  const handleSubmit = () => {
    if (!reflection.trim()) {
      Alert.alert("Empty reflection", "Please enter some text first.");
      return;
    }

    if (analysis.hasProfanity) {
      Alert.alert(
        "Submission blocked",
        "Please remove inappropriate language before submitting.",
      );
      return;
    }

    Alert.alert("Submitted", "Your reflection was accepted.");
    setReflection("");
  };

  const severityStyle =
    analysis.severity === "none"
      ? styles.goodBox
      : analysis.severity === "mild"
        ? styles.mildBox
        : styles.highBox;

  const severityLabel =
    analysis.severity === "none"
      ? "APPROPRIATE"
      : analysis.severity === "mild"
        ? "MILD WARNING"
        : "HIGH WARNING";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>CSE3MAD Assessment 3 - Prototype</Text>
      <Text style={styles.subtitle}>Intelligent classroom-safe text input</Text>

      <TextInput
        style={styles.input}
        placeholder="Write your reflection..."
        multiline
        value={reflection}
        onChangeText={setReflection}
      />

      <View style={[styles.statusBox, severityStyle]}>
        <Text style={styles.statusLabel}>{severityLabel}</Text>
        <Text>{analysis.statusText}</Text>
      </View>

      <Text style={styles.sectionTitle}>Cleaned Preview</Text>
      <View style={styles.previewBox}>
        <Text>{analysis.cleanedText || "No preview yet."}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          analysis.canSubmit ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    minHeight: 120,
    marginBottom: 10,
  },
  statusBox: {
    padding: 10,
    marginBottom: 10,
  },
  goodBox: { backgroundColor: "#d4edda" },
  mildBox: { backgroundColor: "#fff3cd" },
  highBox: { backgroundColor: "#f8d7da" },
  statusLabel: { fontWeight: "bold" },
  previewBox: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: "bold", marginTop: 10 },
  button: {
    padding: 15,
    alignItems: "center",
  },
  buttonEnabled: { backgroundColor: "blue" },
  buttonDisabled: { backgroundColor: "grey" },
  buttonText: { color: "white" },
});
