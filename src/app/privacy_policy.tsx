import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageSourcePropType, SafeAreaView } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import Policy from '@/components/policy&terms/PrivacyPolicy';
import Terms from '@/components/policy&terms/TermsCondition';
import Guidelines from '@/components/policy&terms/Guidelines';
import colors from "@/config/colors";

// Define the type for your state
type ActiveSection =
  | "Community Guidelines"
  | "Privacy Policy"
  | "Terms of Service"
  | null;

const Privacy: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("Privacy Policy");
  const renderSectionText = (): JSX.Element | null => {
    switch (activeSection) {
      case "Community Guidelines":
        return <Guidelines />;
      case "Privacy Policy":
        return <Policy />;
      case "Terms of Service":
        return <Terms />;
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.main}>
              <TouchableOpacity
                style={[
                  styles.section,
                  activeSection === "Community Guidelines" &&
                    styles.sectionActive,
                ]}
                onPress={() => setActiveSection("Community Guidelines")}
              >
                <Text style={styles.sectionText}>Community Guidelines</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.section,
                  activeSection === "Privacy Policy" && styles.sectionActive,
                ]}
                onPress={() => setActiveSection("Privacy Policy")}
              >
                <Text style={styles.sectionText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.section,
                  activeSection === "Terms of Service" && styles.sectionActive,
                ]}
                onPress={() => setActiveSection("Terms of Service")}
              >
                <Text style={styles.sectionText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionActiveText}>{renderSectionText()}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    padding: 10,
  },

  main: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
    gap: 20,
    marginTop: 20,
  },
  section: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    width: 100,
    marginTop: 40,
    height: 60,
  },
  sectionText: {
    textAlign: "center",
  },
  sectionActive: {
    transform: [{ translateY: -2 }],
    backgroundColor: colors.__amico_blue,
    color: "white",
    maxWidth: 800,
    width: 100,
    marginTop: 40,
    height: 60,
  },
  sectionActiveText: {},
});

export default Privacy;
