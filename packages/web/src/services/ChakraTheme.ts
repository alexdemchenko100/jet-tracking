import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "2rem",
  },
  colors: {
    lightgray: {
      100: "#f1f2f8",
    },
    darkgray: {
      100: "#25292f"
    },
    gray: {
      100: "#6b6e73",
      200: "#dbdbdb",
    },
    darkblue: {
      100: "#17468F",
      200: "#16166A",
    },
    blue: {
      100: "#0C38D8",
      200: "#3120F0",
      300: "#451AD8",
    },
    royalblue: {
      100: "#4972E1",
      200: "#8D77F6"
    },
    lightblue: {
      100: "#68CCDF",
      200: "#10B2D7",
    }
  },
})
