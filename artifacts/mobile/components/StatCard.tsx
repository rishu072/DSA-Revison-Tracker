import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  accent?: string;
  accentBg?: string;
}

export default function StatCard({ label, value, icon, accent, accentBg }: Props) {
  const colors = useColors();
  const iconColor = accent ?? colors.primary;
  const iconBg = accentBg ?? colors.secondary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
    gap: 6,
    minWidth: 100,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
