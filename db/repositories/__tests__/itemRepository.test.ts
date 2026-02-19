import { createMockSQLiteContext } from "@/test-utils";
import * as itemRepository from "../itemRepository";

describe("itemRepository", () => {
  let mockDb: ReturnType<typeof createMockSQLiteContext>;

  beforeEach(() => {
    mockDb = createMockSQLiteContext();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("fetches all items ordered by pali", async () => {
      const mockRows = [
        {
          id: 1,
          type: "word",
          pali: "dhamma",
          meaning: "teaching",
          notes: null,
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          type: "prefix",
          pali: "a-",
          meaning: "not",
          notes: "negation prefix",
          created_at: "2024-01-02T00:00:00.000Z",
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await itemRepository.getAll(mockDb);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM items ORDER BY pali COLLATE NOCASE"
      );
      expect(result).toHaveLength(2);
      expect(result[0].pali).toBe("dhamma");
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("returns empty array when no items exist", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await itemRepository.getAll(mockDb);

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("returns item when found", async () => {
      const mockRow = {
        id: 1,
        type: "word",
        pali: "dhamma",
        meaning: "teaching",
        notes: null,
        created_at: "2024-01-01T00:00:00.000Z",
      };
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await itemRepository.getById(mockDb, 1);

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM items WHERE id = ?", [1]);
      expect(result).not.toBeNull();
      expect(result?.pali).toBe("dhamma");
    });

    it("returns null when item not found", async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await itemRepository.getById(mockDb, 999);

      expect(result).toBeNull();
    });
  });

  describe("search", () => {
    it("searches items by pali or meaning", async () => {
      const mockRows = [
        {
          id: 1,
          type: "word",
          pali: "dhamma",
          meaning: "teaching",
          notes: null,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await itemRepository.search(mockDb, "dhamma");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE pali LIKE ? COLLATE NOCASE"),
        ["%dhamma%", "%dhamma%"]
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("create", () => {
    it("creates item with study states and deck assignment", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
      mockDb.getFirstAsync.mockResolvedValue({
        id: 1,
        type: "word",
        pali: "dhamma",
        meaning: "teaching",
        notes: null,
        created_at: "2024-01-01T00:00:00.000Z",
      });

      const result = await itemRepository.create(mockDb, {
        type: "word",
        pali: "dhamma",
        meaning: "teaching",
      });

      // Should insert item
      expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO items"), [
        "word",
        "dhamma",
        "teaching",
        null,
      ]);

      // Should create both study states
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "INSERT INTO study_states (item_id, direction) VALUES (?, ?)",
        [1, "pali_to_meaning"]
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "INSERT INTO study_states (item_id, direction) VALUES (?, ?)",
        [1, "meaning_to_pali"]
      );

      // Should add to default deck
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO deck_items (deck_id, item_id) VALUES (?, ?)",
        [1, 1]
      );

      expect(result.pali).toBe("dhamma");
    });
  });

  describe("update", () => {
    it("updates item fields", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
      mockDb.getFirstAsync.mockResolvedValue({
        id: 1,
        type: "word",
        pali: "dhamma",
        meaning: "updated meaning",
        notes: null,
        created_at: "2024-01-01T00:00:00.000Z",
      });

      const result = await itemRepository.update(mockDb, 1, {
        meaning: "updated meaning",
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith("UPDATE items SET meaning = ? WHERE id = ?", [
        "updated meaning",
        "1",
      ]);
      expect(result?.meaning).toBe("updated meaning");
    });

    it("returns existing item when no fields to update", async () => {
      mockDb.getFirstAsync.mockResolvedValue({
        id: 1,
        type: "word",
        pali: "dhamma",
        meaning: "teaching",
        notes: null,
        created_at: "2024-01-01T00:00:00.000Z",
      });

      const result = await itemRepository.update(mockDb, 1, {});

      expect(mockDb.runAsync).not.toHaveBeenCalled();
      expect(result?.pali).toBe("dhamma");
    });
  });

  describe("deleteItem", () => {
    it("deletes item and returns true", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      const result = await itemRepository.deleteItem(mockDb, 1);

      expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM items WHERE id = ?", [1]);
      expect(result).toBe(true);
    });

    it("returns false when item not found", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 });

      const result = await itemRepository.deleteItem(mockDb, 999);

      expect(result).toBe(false);
    });
  });

  describe("getAllDecks", () => {
    it("fetches all decks ordered by name", async () => {
      const mockRows = [
        { id: 1, name: "All", created_at: "2024-01-01T00:00:00.000Z" },
        { id: 2, name: "Custom Deck", created_at: "2024-01-02T00:00:00.000Z" },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await itemRepository.getAllDecks(mockDb);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM decks ORDER BY name COLLATE NOCASE"
      );
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("All");
    });
  });

  describe("getDecksForItem", () => {
    it("fetches decks for a specific item", async () => {
      const mockRows = [{ id: 1, name: "All", created_at: "2024-01-01T00:00:00.000Z" }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await itemRepository.getDecksForItem(mockDb, 1);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE di.item_id = ?"),
        [1]
      );
      expect(result).toHaveLength(1);
    });
  });
});
