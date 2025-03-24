"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP, resendOTP } = useAuth();
  const { colors } = useTheme();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!email) {
      router.replace("/auth/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(email || "", otpValue);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendOTP(email || "");
      setCountdown(60);
      setCanResend(false);
      Alert.alert("Success", "Verification code resent successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to resend verification code. Please try again."
      );
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Feather name="mail" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Verify your email
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              We've sent a verification code to{"\n"}
              <Text style={{ fontWeight: "bold" }}>{email}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={(e) => handleKeyPress(index, e)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <Button
            onPress={handleVerify}
            isLoading={isLoading}
            style={styles.verifyButton}
            disabled={otp.join("").length !== 6}
          >
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          </Button>

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={{ color: colors.primary }}>
                  Resend verification code
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: colors.muted }}>
                Resend code in {countdown} seconds
              </Text>
            )}
          </View>

          <Text style={[styles.helpText, { color: colors.muted }]}>
            Check your spam folder if you don't see the email in your inbox
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  verifyButton: {
    height: 50,
    width: "100%",
    marginBottom: 24,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    marginBottom: 24,
  },
  helpText: {
    textAlign: "center",
  },
});
