"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import { DialogFooter } from "@dcc-chatbot/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@dcc-chatbot/ui/components/field";
import { Input } from "@dcc-chatbot/ui/components/input";
import { Textarea } from "@dcc-chatbot/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import type { SystemPrompt } from "@/lib/types";
import { useCreatePrompt } from "../_hooks/use-create-prompt";
import { useUpdatePrompt } from "../_hooks/use-update-prompt";

const promptFormSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(50, "Title must be at most 50 characters."),
  content: z
    .string()
    .min(5, "Prompt content must be at least 5 characters.")
    .max(3000, "Content must be at most 3000 characters."),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

interface PromptUpsertFormProps {
  projectId: string;
  prompt?: SystemPrompt | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function PromptUpsertForm({
  projectId,
  prompt,
  onCancel,
  onSuccess,
}: PromptUpsertFormProps) {
  const { mutate: createPrompt, isPending: isCreating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: isUpdating } = useUpdatePrompt();
  const isPending = isCreating || isUpdating;

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: prompt?.title || "",
      content: prompt?.content || "",
    },
  });

  const onSubmit = (data: PromptFormValues) => {
    if (prompt) {
      updatePrompt(
        { projectId, id: prompt.id, ...data },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createPrompt(
        { projectId, ...data },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Title Field */}
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Prompt Title</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g. Technical Code Reviewer"
              autoComplete="off"
            />
            <FieldDescription>
              Short descriptive title for this persona instruction.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Content Field */}
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>System Instructions</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="You are a helpful software engineering assistant specialized in..."
              rows={5}
              className="font-mono text-xs"
            />
            <FieldDescription>
              Detailed instructions to guide AI responses for this project.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <DialogFooter className="pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? prompt
              ? "Saving..."
              : "Creating..."
            : prompt
              ? "Save Changes"
              : "Create System Prompt"}
        </Button>
      </DialogFooter>
    </form>
  );
}
