import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    marginVertical: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#6b7280",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 16,
  },
})

