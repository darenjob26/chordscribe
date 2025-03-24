"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import ThemedButton from "@/components/ui/TButton";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(email, otpString);
      router.push("/");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await resendOTP(email);
      setCountdown(60);
      setCanResend(false);
      Alert.alert("Success", "Verification code has been resent to your email");
    } catch (error) {
      Alert.alert("Error", "Failed to resend verification code. Please try again.");
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }}>
          <View className="items-center mb-8">
            <View
              className="w-16 h-16 rounded-full justify-center items-center mb-4"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Feather name="mail" size={32} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
              Verify your email
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Enter the verification code sent to {email}
            </Text>
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between mb-6">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className="w-12 h-12 border rounded-lg text-center text-xl"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <ThemedButton
              title="Verify Email"
              onPress={handleVerify}
              disabled={isLoading}
            />

            <View className="flex-row justify-center my-3">
              <Text style={{ color: colors.muted }}>
                Didn't receive the code?{" "}
              </Text>
              {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={{ color: colors.primary }}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: colors.muted }}>
                    Resend in {countdown}s
                  </Text>
                )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
