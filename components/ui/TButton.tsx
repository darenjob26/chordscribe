import { Feather } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View, Text, ButtonProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme-provider';

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
                return "bg-black";
            case "outline":
                return "bg-white border border-black";
            case "ghost":
                return "bg-transparent";
            case "destructive":
                return "bg-red-500";
        }
    }

    const getTextColor = () => {
        switch (variant) {
            case "default":
                return "text-white";
            case "outline":
                return "text-black";
            case "ghost":
                return "text-black";
            case "destructive":
                return "text-white";
        }
    }

    const getTextSize = () => {
        switch (size) {
            case "sm":
                return "text-md";
            case "md":
                return "text-lg";
            case "lg":
                return "text-xl";
        }
    }

    return (
        <TouchableOpacity
            className={`
                flex-row items-center justify-center rounded-lg py-2.5 px-5 h-[50px]
                ${getButtonStyles()}
            `}
            {...props}
        >
            {leftIcon && <>{leftIcon}</>}
            <Text className={`
                font-medium 
                ${getTextSize()}
                ${getTextColor()}
            `}>{title}</Text>
            {rightIcon && <>{rightIcon}</>}
        </TouchableOpacity>
    );
}