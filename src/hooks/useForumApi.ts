import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptAnswer,
  closeQuestion,
  createAnswer,
  createComment,
  createQuestion,
  featureQuestion,
  getQuestion,
  listQuestions,
  report,
  searchQuestions,
  updateAnswer,
  updateQuestion,
  vote,
  type AnswerPayload,
  type CommentPayload,
  type ForumQuestionQuery,
  type QuestionPayload,
  type ReportPayload,
  type VotePayload,
} from "@/lib/api/forum";

export const forumKeys = {
  questions: (params: ForumQuestionQuery = {}) => ["forum", "questions", params] as const,
  question: (id: string) => ["forum", "question", id] as const,
  search: (query: string) => ["forum", "search", query] as const,
};

export function useForumQuestions(params: ForumQuestionQuery = {}) {
  return useQuery({
    queryKey: forumKeys.questions(params),
    queryFn: () => listQuestions(params),
    retry: false,
  });
}

export function useForumQuestion(id: string) {
  return useQuery({
    queryKey: forumKeys.question(id),
    queryFn: () => getQuestion(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useForumSearch(query: string) {
  return useQuery({
    queryKey: forumKeys.search(query),
    queryFn: () => searchQuestions(query),
    enabled: query.trim().length >= 2,
    retry: false,
  });
}

export function useCreateForumQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuestionPayload) => createQuestion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum", "questions"] }),
  });
}

export function useUpdateForumQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<QuestionPayload> }) => updateQuestion(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum", "questions"] });
      queryClient.invalidateQueries({ queryKey: forumKeys.question(variables.id) });
    },
  });
}

export function useCreateForumAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: AnswerPayload }) =>
      createAnswer(questionId, payload),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: forumKeys.question(variables.questionId) }),
  });
}

export function useUpdateForumAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Pick<AnswerPayload, "content"> }) => updateAnswer(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useAcceptForumAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptAnswer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useCreateForumComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentPayload) => createComment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useForumVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VotePayload) => vote(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useForumReport() {
  return useMutation({
    mutationFn: (payload: ReportPayload) => report(payload),
  });
}

export function useFeatureForumQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: featureQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useCloseForumQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}
