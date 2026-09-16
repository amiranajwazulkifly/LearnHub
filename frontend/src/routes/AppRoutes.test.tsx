import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { User } from "../types/user";

// Routing is the subject here, so every page is a stub that just names
// itself. Guards, redirects and the login flow are the real implementations.
vi.mock("../pages/student/StudentDashboardPage", () => ({ default: () => <p>student dashboard</p> }));
vi.mock("../pages/student/StudentTasksPage", () => ({ default: () => <p>student tasks</p> }));
vi.mock("../pages/admin/AdminDashboardPage", () => ({ default: () => <p>admin dashboard</p> }));
vi.mock("../pages/instructor/InstructorDashboardPage", () => ({ default: () => <p>instructor dashboard</p> }));

// Layout chrome (notification bell, announcement badge) calls the API. Every
// raw request fails, which those components already tolerate silently.
vi.mock("../api/axiosInstance", () => {
  const fail = () => Promise.reject(new Error("no network in tests"));
  return { default: { get: vi.fn(fail), post: vi.fn(fail), patch: vi.fn(fail), delete: vi.fn(fail) } };
});

vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

const { authService } = await import("../services/authService");
const { default: AppRoutes } = await import("./AppRoutes");
const { useAuthStore } = await import("../store/useAuthStore");

function makeUser(role: User["role"]): User {
  return {
    id: `${role}-id`,
    fullName: `Test ${role}`,
    email: `${role}@example.com`,
    role,
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

function signInAs(role: User["role"]) {
  localStorage.setItem("learnhub_auth_token", "stored-token");
  vi.mocked(authService.getCurrentUser).mockResolvedValue({ user: makeUser(role) });
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  });
});

describe("routing and access control", () => {
  test("with no session, the home route goes to login", async () => {
    renderAt("/");
    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("a protected page without a session goes to login", async () => {
    renderAt("/student/tasks");
    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText("student tasks")).not.toBeInTheDocument();
  });

  test.each([
    ["student", "student dashboard"],
    ["instructor", "instructor dashboard"],
    ["admin", "admin dashboard"],
  ] as const)("a signed-in %s is sent to their own dashboard", async (role, landing) => {
    signInAs(role);
    renderAt("/");
    expect(await screen.findByText(landing)).toBeInTheDocument();
  });

  test("a student opening an admin page lands on their own dashboard instead", async () => {
    signInAs("student");
    renderAt("/admin");
    expect(await screen.findByText("student dashboard")).toBeInTheDocument();
    expect(screen.queryByText("admin dashboard")).not.toBeInTheDocument();
  });

  test("an invalid stored token is discarded and the user is sent to login", async () => {
    localStorage.setItem("learnhub_auth_token", "expired-token");
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("401"));

    renderAt("/student");

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem("learnhub_auth_token")).toBeNull();
  });

  test("an unknown URL shows a not-found page rather than silently redirecting", async () => {
    renderAt("/definitely/not/a/page");
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });
});

describe("login", () => {
  test("signing in stores the session and redirects by role", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      user: makeUser("instructor"),
      token: "fresh-token",
    });

    renderAt("/login");

    await user.type(await screen.findByLabelText(/email/i), "sarah@example.com");
    await user.type(screen.getByLabelText(/^password/i), "TestPass123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("instructor dashboard")).toBeInTheDocument();
    expect(authService.login).toHaveBeenCalledWith(
      expect.objectContaining({ email: "sarah@example.com", password: "TestPass123!" }),
    );
    expect(localStorage.getItem("learnhub_auth_token")).toBe("fresh-token");
  });

  test("a failed sign-in keeps the user on the login page", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue(new Error("Invalid email or password"));

    renderAt("/login");

    await user.type(await screen.findByLabelText(/email/i), "sarah@example.com");
    await user.type(screen.getByLabelText(/^password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem("learnhub_auth_token")).toBeNull();
  });
});
