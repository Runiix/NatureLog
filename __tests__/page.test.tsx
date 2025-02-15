import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import loginpage from "../app/(no_user_pages)/loginpage/page";
import LoginPage from "../app/(no_user_pages)/loginpage/page";

describe("Page", () => {
  it("renders a heading", () => {
    render(<LoginPage />);

    const myElem = screen.getByText("NatureLog");

    expect(myElem).toBeInTheDocument();
  });
});
