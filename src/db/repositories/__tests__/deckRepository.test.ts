import { createMockSQLiteContext } from "@/test-utils";
import * as deckRepository from "../deckRepository";

describe("deckRepository", () => {
  let mockDb: ReturnType<typeof createMockSQLiteContext>;

  beforeEach(() => {
    mockDb = createMockSQLiteContext();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("fetches all decks with item counts ordered by name", async () => {
      const mockRows = [
        { id: 1, name: "All", created_at: "2024-01-01T00:00:00.000Z", item_count: 10 },
        { id: 2, name: "Verbs", created_at: "2024-01-02T00:00:00.000Z", item_count: 5 },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await deckRepository.getAll(mockDb);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.stringContaining("ORDER BY"));
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("All");
      expect(result[0].itemCount).toBe(10);
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("returns empty array when no decks exist", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await deckRepository.getAll(mockDb);

      expect(result).toEqual([]);
    });

    it("applies sort option correctly", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await deckRepository.getAll(mockDb, "date_desc");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.stringContaining("created_at DESC"));
    });
  });

  describe("getById", () => {
    it("returns deck with item count when found", async () => {
      const mockRow = {
        id: 2,
        name: "Verbs",
        created_at: "2024-01-02T00:00:00.000Z",
        item_count: 5,
      };
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await deckRepository.getById(mockDb, 2);

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE d.id = ?"),
        [2]
      );
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Verbs");
      expect(result?.itemCount).toBe(5);
    });

    it("returns null when deck not found", async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await deckRepository.getById(mockDb, 999);

      expect(result).toBeNull();
    });
  });

  describe("search", () => {
    it("searches decks by name case-insensitively", async () => {
      const mockRows = [
        { id: 2, name: "Verbs", created_at: "2024-01-02T00:00:00.000Z", item_count: 5 },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await deckRepository.search(mockDb, "verb");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE d.name LIKE ? COLLATE NOCASE"),
        ["%verb%"]
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("nameExists", () => {
    it("returns true when name exists", async () => {
      mockDb.getFirstAsync.mockResolvedValue({ "1": 1 });

      const result = await deckRepository.nameExists(mockDb, "Verbs");

      expect(result).toBe(true);
    });

    it("returns false when name does not exist", async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await deckRepository.nameExists(mockDb, "NewDeck");

      expect(result).toBe(false);
    });

    it("excludes specified id when checking", async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await deckRepository.nameExists(mockDb, "Verbs", 2);

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining("AND id != ?"), [
        "Verbs",
        2,
      ]);
    });
  });

  describe("create", () => {
    it("creates deck with valid name", async () => {
      mockDb.getFirstAsync
        .mockResolvedValueOnce(null) // nameExists check
        .mockResolvedValueOnce({
          id: 2,
          name: "Verbs",
          created_at: "2024-01-02T00:00:00.000Z",
        });
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 2 });

      const result = await deckRepository.create(mockDb, "Verbs");

      expect(mockDb.runAsync).toHaveBeenCalledWith("INSERT INTO decks (name) VALUES (?)", [
        "Verbs",
      ]);
      expect(result.name).toBe("Verbs");
    });

    it("throws error for empty name", async () => {
      await expect(deckRepository.create(mockDb, "")).rejects.toThrow("Deck name cannot be empty");
    });

    it("throws error for whitespace-only name", async () => {
      await expect(deckRepository.create(mockDb, "   ")).rejects.toThrow(
        "Deck name cannot be empty"
      );
    });

    it('throws error for reserved name "All"', async () => {
      await expect(deckRepository.create(mockDb, "All")).rejects.toThrow(
        'Cannot use reserved name "All"'
      );
    });

    it('throws error for "all" (case-insensitive)', async () => {
      await expect(deckRepository.create(mockDb, "all")).rejects.toThrow(
        'Cannot use reserved name "All"'
      );
    });

    it("throws error for duplicate name", async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ "1": 1 }); // nameExists returns true

      await expect(deckRepository.create(mockDb, "Verbs")).rejects.toThrow(
        "A deck with this name already exists"
      );
    });
  });

  describe("update", () => {
    it("updates deck name", async () => {
      mockDb.getFirstAsync
        .mockResolvedValueOnce(null) // nameExists check
        .mockResolvedValueOnce({
          id: 2,
          name: "Updated Name",
          created_at: "2024-01-02T00:00:00.000Z",
        });
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      const result = await deckRepository.update(mockDb, 2, "Updated Name");

      expect(mockDb.runAsync).toHaveBeenCalledWith("UPDATE decks SET name = ? WHERE id = ?", [
        "Updated Name",
        2,
      ]);
      expect(result?.name).toBe("Updated Name");
    });

    it('throws error when attempting to rename default "All" deck', async () => {
      await expect(deckRepository.update(mockDb, 1, "New Name")).rejects.toThrow(
        'Cannot rename the "All" deck'
      );
    });

    it("throws error for empty name", async () => {
      await expect(deckRepository.update(mockDb, 2, "")).rejects.toThrow(
        "Deck name cannot be empty"
      );
    });
  });

  describe("deleteDeck", () => {
    it("deletes deck and returns true", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      const result = await deckRepository.deleteDeck(mockDb, 2);

      expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM decks WHERE id = ?", [2]);
      expect(result).toBe(true);
    });

    it("returns false when deck not found", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 });

      const result = await deckRepository.deleteDeck(mockDb, 999);

      expect(result).toBe(false);
    });

    it('throws error when attempting to delete default "All" deck', async () => {
      await expect(deckRepository.deleteDeck(mockDb, 1)).rejects.toThrow(
        'Cannot delete the "All" deck'
      );
    });
  });

  describe("getItemsInDeck", () => {
    it("fetches items in a deck", async () => {
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

      const result = await deckRepository.getItemsInDeck(mockDb, 2);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE di.deck_id = ?"),
        [2]
      );
      expect(result).toHaveLength(1);
      expect(result[0].pali).toBe("dhamma");
    });
  });

  describe("getItemsNotInDeck", () => {
    it("fetches items not in a deck", async () => {
      const mockRows = [
        {
          id: 2,
          type: "prefix",
          pali: "a-",
          meaning: "not",
          notes: null,
          created_at: "2024-01-02T00:00:00.000Z",
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await deckRepository.getItemsNotInDeck(mockDb, 2);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.stringContaining("NOT IN"), [2]);
      expect(result).toHaveLength(1);
      expect(result[0].pali).toBe("a-");
    });
  });

  describe("addItemsToDeck", () => {
    it("adds multiple items to a deck", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      await deckRepository.addItemsToDeck(mockDb, 2, [1, 2, 3]);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO deck_items (deck_id, item_id) VALUES (?, ?)",
        [2, 1]
      );
    });

    it("does nothing when itemIds is empty", async () => {
      await deckRepository.addItemsToDeck(mockDb, 2, []);

      expect(mockDb.withTransactionAsync).not.toHaveBeenCalled();
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe("removeItemFromDeck", () => {
    it("removes item from deck and returns true", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      const result = await deckRepository.removeItemFromDeck(mockDb, 2, 1);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "DELETE FROM deck_items WHERE deck_id = ? AND item_id = ?",
        [2, 1]
      );
      expect(result).toBe(true);
    });

    it("returns false when item not in deck", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 });

      const result = await deckRepository.removeItemFromDeck(mockDb, 2, 999);

      expect(result).toBe(false);
    });

    it('throws error when attempting to remove from "All" deck', async () => {
      await expect(deckRepository.removeItemFromDeck(mockDb, 1, 1)).rejects.toThrow(
        'Cannot remove items from the "All" deck'
      );
    });
  });
});
