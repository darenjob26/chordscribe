"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Feather name="music" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to ChordScribe
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Enter your credentials to access your account
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Email Input */}
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Feather
                name="mail"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={{ color: colors.primary }}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Button>

            <View style={styles.dividerContainer}>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.dividerText, { color: colors.muted }]}>
                OR
              </Text>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            </View>

            <Button
              variant="outline"
              onPress={() => {}}
              style={styles.googleButton}
              leftIcon={<GoogleIcon />}
            >
              <Text style={{ color: colors.text }}>Sign in with Google</Text>
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={{ color: colors.muted }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
              <Text style={{ color: colors.primary }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  loginButton: {
    height: 50,
    marginBottom: 24,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 8,
  },
  googleButton: {
    height: 50,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  googleIconText: {
    color: "white",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
