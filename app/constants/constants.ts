import { styled } from "@mui/material";
import { Slider } from "@mui/material";

export const colorsList = [
  {
    eng: "black",
    ger: "schwarz",
    styleBg: "bg-black",
    styleBorder: "border-black",
  },
  {
    eng: "white",
    ger: "weiß",
    styleBg: "bg-slate-200",
    styleBorder: "border-slate-400",
  },
  {
    eng: "brown",
    ger: "braun",
    styleBg: "bg-yellow-950",
    styleBorder: "border-yellow-950",
  },
  {
    eng: "yellow",
    ger: "gelb",
    styleBg: "bg-yellow-400",
    styleBorder: "border-yellow-400",
  },
  {
    eng: "red",
    ger: "rot",
    styleBg: "bg-red-600",
    styleBorder: "border-red-600",
  },
  {
    eng: "green",
    ger: "grün",
    styleBg: "bg-green-600",
    styleBorder: "border-green-600",
  },
  {
    eng: "blue",
    ger: "blau",
    styleBg: "bg-blue-600",
    styleBorder: "border-blue-600",
  },
  {
    eng: "purple",
    ger: "lila",
    styleBg: "bg-purple-800",
    styleBorder: "border-purple-800",
  },
  {
    eng: "orange",
    ger: "orange",
    styleBg: "bg-orange-600",
    styleBorder: "border-orange-600",
  },
];

export const SizeSlider = styled(Slider)({
  color: "#16A34A",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#16A34A",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&::before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});
