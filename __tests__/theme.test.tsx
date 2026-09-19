import { act, render, screen } from "@testing-library/react";
import {
  SYSTEM_THEME_SCRIPT,
  THEME_COOKIE,
  parseTheme,
} from "@/app/[locale]/components/ui/theme/theme";
import { ThemeProvider, useTheme } from "@/app/[locale]/components/ui/theme/ThemeProvider";

/** A controllable prefers-color-scheme media query. */
function mockSystemDark(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  window.matchMedia = jest.fn().mockImplementation(() => ({
    get matches() {
      return matches;
    },
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
  return {
    set(dark: boolean) {
      matches = dark;
      listeners.forEach((cb) => cb());
    },
  };
}

const isDark = () => document.documentElement.classList.contains("dark");

beforeEach(() => {
  document.documentElement.className = "";
  document.cookie = `${THEME_COOKIE}=; Max-Age=0; Path=/`;
});

describe("parseTheme", () => {
  test.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    [undefined, "system"],
    ["", "system"],
    ["DARK", "system"],
    ["dark; injected", "system"],
  ])("%p -> %p", (input, expected) => {
    expect(parseTheme(input)).toBe(expected);
  });
});

describe("SYSTEM_THEME_SCRIPT", () => {
  test("adds the class only when the OS prefers dark", () => {
    mockSystemDark(false);
    new Function(SYSTEM_THEME_SCRIPT)();
    expect(isDark()).toBe(false);

    mockSystemDark(true);
    new Function(SYSTEM_THEME_SCRIPT)();
    expect(isDark()).toBe(true);
  });

  test("never throws, even without matchMedia", () => {
    // @ts-expect-error simulating an old browser
    window.matchMedia = undefined;
    expect(() => new Function(SYSTEM_THEME_SCRIPT)()).not.toThrow();
  });
});

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <>
      <span data-testid="state">{`${theme}/${resolvedTheme}`}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("system")}>system</button>
    </>
  );
}

describe("ThemeProvider", () => {
  test("follows the OS live while the preference is system", () => {
    const system = mockSystemDark(false);
    render(
      <ThemeProvider initialTheme="system">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("system/light");
    expect(isDark()).toBe(false);

    act(() => system.set(true));
    expect(screen.getByTestId("state")).toHaveTextContent("system/dark");
    expect(isDark()).toBe(true);
  });

  test("an explicit choice overrides the OS and is persisted", () => {
    const system = mockSystemDark(true);
    render(
      <ThemeProvider initialTheme="system">
        <Probe />
      </ThemeProvider>,
    );

    act(() => screen.getByText("light").click());
    expect(isDark()).toBe(false);
    expect(document.cookie).toContain(`${THEME_COOKIE}=light`);

    // No longer listening to the OS.
    act(() => system.set(true));
    expect(isDark()).toBe(false);

    act(() => screen.getByText("dark").click());
    expect(isDark()).toBe(true);
    expect(document.cookie).toContain(`${THEME_COOKIE}=dark`);
  });

  test("keeps the class the head script set for a dark OS", () => {
    mockSystemDark(true);
    document.documentElement.classList.add("dark"); // as SYSTEM_THEME_SCRIPT would
    render(
      <ThemeProvider initialTheme="system">
        <Probe />
      </ThemeProvider>,
    );
    expect(isDark()).toBe(true);
  });

  test("an explicit initial theme is applied without consulting the OS", () => {
    mockSystemDark(true);
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("light/light");
    expect(isDark()).toBe(false);
  });
});
