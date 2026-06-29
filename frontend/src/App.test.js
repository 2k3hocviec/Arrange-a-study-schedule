import { paginate } from "./utils/pagination";

describe("paginate", () => {
  const users = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1
  }));

  test("returns the requested page of users", () => {
    const result = paginate(users, 2, 10);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.startIndex).toBe(10);
    expect(result.items.map(user => user.id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ]);
  });

  test("keeps the page valid after filtered data shrinks", () => {
    const result = paginate(users.slice(0, 4), 3, 10);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(4);
  });

  test("handles an empty user list", () => {
    const result = paginate([], 1, 10);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.startIndex).toBe(0);
    expect(result.items).toEqual([]);
  });
});
