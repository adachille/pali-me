// Lesson progression logic: prerequisites and node building
//
// This module knows which nodes a lesson has and what each node depends on.
// It delegates the "are prerequisites met?" check to lessonRepository.getNodeState.

import { getNodeState } from "@/db/repositories/lessonRepository";
import type { LessonProgress } from "@/db/types";
import type { LessonContent, LessonNodeType, NodeState } from "./types";

export type NodeInfo = {
  type: LessonNodeType;
  state: NodeState;
  label: string;
};

/**
 * Builds the prerequisite list for a given node.
 * - learn node for lesson 1: no prerequisites
 * - learn node for lesson N>1: all nodes from lesson N-1
 * - practice nodes: same lesson's learn node
 */
export function getPrerequisites(
  lesson: LessonContent,
  nodeType: LessonNodeType,
  prevLesson: LessonContent | undefined
): { lessonNumber: number; nodeType: LessonNodeType }[] {
  if (nodeType !== "learn") {
    return [{ lessonNumber: lesson.lesson_number, nodeType: "learn" }];
  }

  if (lesson.lesson_number === 1 || !prevLesson) {
    return [];
  }

  const prereqs: { lessonNumber: number; nodeType: LessonNodeType }[] = [
    { lessonNumber: prevLesson.lesson_number, nodeType: "learn" },
  ];
  if (prevLesson.vocabulary.length > 0) {
    prereqs.push({ lessonNumber: prevLesson.lesson_number, nodeType: "vocab_practice" });
  }
  if (prevLesson.exercises.length > 0) {
    prereqs.push({ lessonNumber: prevLesson.lesson_number, nodeType: "exercise_practice" });
  }
  return prereqs;
}

/**
 * Builds the list of nodes for a lesson with their computed states.
 */
export function buildNodes(
  lesson: LessonContent,
  prevLesson: LessonContent | undefined,
  allProgress: LessonProgress[]
): NodeInfo[] {
  const nodes: NodeInfo[] = [];

  // Learn node (always present)
  nodes.push({
    type: "learn",
    state: getNodeState(
      allProgress,
      lesson.lesson_number,
      "learn",
      getPrerequisites(lesson, "learn", prevLesson)
    ),
    label: "Learn",
  });

  // Vocab practice (only if lesson has vocabulary)
  if (lesson.vocabulary.length > 0) {
    nodes.push({
      type: "vocab_practice",
      state: getNodeState(
        allProgress,
        lesson.lesson_number,
        "vocab_practice",
        getPrerequisites(lesson, "vocab_practice", prevLesson)
      ),
      label: "Vocab",
    });
  }

  // Exercise practice (only if lesson has exercises)
  if (lesson.exercises.length > 0) {
    nodes.push({
      type: "exercise_practice",
      state: getNodeState(
        allProgress,
        lesson.lesson_number,
        "exercise_practice",
        getPrerequisites(lesson, "exercise_practice", prevLesson)
      ),
      label: "Exercises",
    });
  }

  return nodes;
}
