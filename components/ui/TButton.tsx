import { Feather } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View, Text, ButtonProps, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme-provider';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends ButtonProps {
    title: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
}

export default function ThemedButton({ title, leftIcon, rightIcon, variant = "default", size = "md", ...props }: ThemedButtonProps) {
    const { colors } = useTheme();

    const getButtonStyles = () => {
        switch (variant) {
            case "default":
                return {
                    backgroundColor: "#000000",
                };
            case "outline":
                return {
                    backgroundColor: "#ffffff",
                    borderColor: "#000000",
                    borderWidth: 1,
                };
            case "ghost":
                return {
                    backgroundColor: "transparent",
                };
            case "destructive":
                return {
                    backgroundColor: "#ef4444",
                };
        }
    }

    const getTextColor = () => {
        switch (variant) {
            case "default":
                return "#ffffff";
            case "outline":
                return "#000000";
            case "ghost":
                return "#000000";
            case "destructive":
                return "#ffffff";
        }
    }

    const getPadding = () => {
        switch (size) {
            case "sm":
                return {
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                };
            case "lg":
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                };
            default:
                return {
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                };
        }
    }

    const getFontSize = () => {
        switch (size) {
            case "sm":
                return 14;
            case "lg":
                return 18;
            default:
                return 16;
        }
    }

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getPadding(),
                getButtonStyles(),
            ]}
            {...props}
        >
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <Text style={[
                styles.text,
                { color: getTextColor(), fontSize: getFontSize() }
            ]}>{title}</Text>
            {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    text: {
        fontWeight: '500',
    },
    iconContainer: {
        marginHorizontal: 4,
    }
});
