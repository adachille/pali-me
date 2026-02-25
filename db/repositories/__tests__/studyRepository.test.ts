import { createMockSQLiteContext } from "@/test-utils";
import * as studyRepository from "../studyRepository";

describe("studyRepository", () => {
  let mockDb: ReturnType<typeof createMockSQLiteContext>;

  beforeEach(() => {
    mockDb = createMockSQLiteContext();
    jest.clearAllMocks();
  });

  describe("getDueCardsForDeck", () => {
    it("fetches due cards for a deck with random direction", async () => {
      const mockRows = [
        {
          study_state_id: 1,
          item_id: 10,
          direction: "pali_to_meaning",
          pali: "dhamma",
          meaning: "teaching",
          type: "word",
          interval: 1,
          ease: 2.5,
          due: "2024-01-01T00:00:00.000Z",
        },
        {
          study_state_id: 2,
          item_id: 10,
          direction: "meaning_to_pali",
          pali: "dhamma",
          meaning: "teaching",
          type: "word",
          interval: 0,
          ease: 2.5,
          due: "2024-01-01T00:00:00.000Z",
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await studyRepository.getDueCardsForDeck(mockDb, 1, "random");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE di.deck_id = ?"),
        [1, null, null]
      );
      expect(result).toHaveLength(2);
      expect(result[0].studyStateId).toBe(1);
      expect(result[0].direction).toBe("pali_to_meaning");
      expect(result[0].due).toBeInstanceOf(Date);
    });

    it("filters by pali_to_meaning when direction is pali_first", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await studyRepository.getDueCardsForDeck(mockDb, 1, "pali_first");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE di.deck_id = ?"),
        [1, "pali_to_meaning", "pali_to_meaning"]
      );
    });

    it("filters by meaning_to_pali when direction is meaning_first", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await studyRepository.getDueCardsForDeck(mockDb, 1, "meaning_first");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE di.deck_id = ?"),
        [1, "meaning_to_pali", "meaning_to_pali"]
      );
    });

    it("returns empty array when no cards are due", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await studyRepository.getDueCardsForDeck(mockDb, 1);

      expect(result).toEqual([]);
    });
  });

  describe("getAllCardsForDeck", () => {
    it("fetches all cards for endless mode", async () => {
      const mockRows = [
        {
          study_state_id: 1,
          item_id: 10,
          direction: "pali_to_meaning",
          pali: "dhamma",
          meaning: "teaching",
          type: "word",
          interval: 5,
          ease: 2.5,
          due: "2024-12-01T00:00:00.000Z",
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await studyRepository.getAllCardsForDeck(mockDb, 1, "random");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY RANDOM()"),
        [1, null, null]
      );
      expect(result).toHaveLength(1);
      expect(result[0].interval).toBe(5);
    });

    it("does not filter by due date", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await studyRepository.getAllCardsForDeck(mockDb, 1);

      const call = mockDb.getAllAsync.mock.calls[0][0];
      expect(call).not.toContain("ss.due <= datetime");
    });
  });

  describe("recordReview", () => {
    it("increases interval on correct answer", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      await studyRepository.recordReview(mockDb, 1, true);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE study_states"),
        [1]
      );
      const sql = mockDb.runAsync.mock.calls[0][0];
      expect(sql).toContain("interval * ease");
      expect(sql).toContain("MIN");
    });

    it("resets interval and decreases ease on incorrect answer", async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

      await studyRepository.recordReview(mockDb, 1, false);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE study_states"),
        [1]
      );
      const sql = mockDb.runAsync.mock.calls[0][0];
      expect(sql).toContain("interval = 0");
      expect(sql).toContain("ease - 0.2");
      expect(sql).toContain("MAX");
    });
  });
});
