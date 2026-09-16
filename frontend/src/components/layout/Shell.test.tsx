import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import { useAuthStore } from "../../store/useAuthStore";

describe("portal navigation", () => {
  test("the mobile drawer supports Escape and returns keyboard focus", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar
          items={[
            { label: "Dashboard", path: "/student", icon: null },
            { label: "Tasks", path: "/student/tasks", icon: null },
          ]}
        />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(
      screen.getByRole("button", { name: "Open navigation" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Open navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
  test("account actions are disclosed and profile links respect the current role", async () => {
    useAuthStore.setState({
      user: {
        id: "test",
        fullName: "Test Instructor",
        email: "instructor@example.com",
        role: "instructor",
        status: "active",
        createdAt: "",
        updatedAt: "",
      },
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Test Instructor/ }));
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/instructor/profile",
    );
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("link", { name: "Profile" }),
    ).not.toBeInTheDocument();
    useAuthStore.setState({ user: null });
  });
});
