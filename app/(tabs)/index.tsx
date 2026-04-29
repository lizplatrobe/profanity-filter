// Import React and required React Native components
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

// Import profanity filtering package
import { Profanity } from "@2toad/profanity";

// Create profanity filter instance using the package's built-in word list
const filter = new Profanity();

// Defines the possible warning levels for the prototype
type Severity = "none" | "mild" | "high";

export default function Index() {
  // Stores the reflection typed by the user
  const [reflection, setReflection] = useState("");

  // Re-analyses the reflection only when the text changes
  const analysis = useMemo(() => {
    const trimmed = reflection.trim();

    // If the user has not typed anything, show a neutral starting message
    if (!trimmed) {
      return {
        hasProfanity: false,
        severity: "none" as Severity,
        statusText: "Start typing to test the classroom-safe filter.",
        cleanedText: "",
        canSubmit: false,
      };
    }
    // Checks whether the typed text contains inappropriate language
    const hasProfanity = filter.exists(trimmed);

    // Creates a censored preview if profanity is found
    const cleanedText = hasProfanity ? filter.censor(trimmed) : trimmed;

    let severity: Severity = "none";
    let statusText = "This text is appropriate for submission.";

    // Counts the number of words typed by the user
    if (hasProfanity) {
      const wordCount = trimmed.split(/\s+/).length;
      // Counts the number of censor symbols in the cleaned version
      const censorCount = (cleanedText.match(/\*/g) || []).length;

      // Simple prototype logic for mild vs high severity
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

    // Returns all values needed by the interface
    return {
      hasProfanity,
      severity,
      statusText,
      cleanedText,
      canSubmit: trimmed.length > 0 && !hasProfanity,
    };
  }, [reflection]);

  const handleSubmit = () => {
    // Prevents empty reflections from being submitted

    if (!reflection.trim()) {
      Alert.alert("Empty reflection", "Please enter some text first.");
      return;
    }

    // Blocks submission if inappropriate language is detected
    if (analysis.hasProfanity) {
      Alert.alert(
        "Submission blocked",
        "Please remove inappropriate language before submitting.",
      );
      return;
    }
    // Accepts the reflection if it passes the filter
    Alert.alert("Submitted", "Your reflection was accepted.");
    setReflection("");
  };

  // Chooses the status box colour based on severity level
  const severityStyle =
    analysis.severity === "none"
      ? styles.goodBox
      : analysis.severity === "mild"
        ? styles.mildBox
        : styles.highBox;

  // Chooses the warning label shown to the user
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
        onChangeText={setReflection} // Updates text and triggers real-time analysis
      />

      {/* Displays the current moderation result */}
      <View style={[styles.statusBox, severityStyle]}>
        <Text style={styles.statusLabel}>{severityLabel}</Text>
        <Text>{analysis.statusText}</Text>
      </View>

      <Text style={styles.sectionTitle}>Cleaned Preview</Text>
      {/* Shows the censored version of the text */}
      <View style={styles.previewBox}>
        <Text>{analysis.cleanedText || "No preview yet."}</Text>
      </View>

      {/* Submit button is visually enabled or disabled based on analysis */}
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

// Basic styling for the prototype interface
const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5, marginTop: 20 },
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
  goodBox: { backgroundColor: "#86f9a1" },
  mildBox: { backgroundColor: "#fa941e" },
  highBox: { backgroundColor: "#fb1f1f" },
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
